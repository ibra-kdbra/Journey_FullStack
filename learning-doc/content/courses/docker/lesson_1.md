# Lesson 1: A Container Is a Process

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Explain what a container is in terms of processes, not virtual machines
- Run a container in the foreground and in the background, and read its exit status
- Walk a container through its lifecycle: created, running, exited, removed
- Look inside a running container with `docker exec`, and read its output with `docker logs`
- Explain why `docker stop` sometimes takes ten seconds, and what exit code 137 means

## 📝 Detailed Content

### 1. Running One Command

Everything in this lesson uses one small image, Alpine Linux, pinned to an exact version so that what you see matches what is printed here. `docker pull -q` downloads it and prints only its name:

```console
$ docker pull -q alpine:3.20.3
docker.io/library/alpine:3.20.3
```

(Without `-q`, `docker pull` draws progress bars, and `docker run` pulls a missing image by itself, drawing the same bars. These lessons always pull first, so that what `run` prints is only what the container prints.)

Now run a command in a container:

```console
$ docker run --rm alpine:3.20.3 echo "hello from a container"
hello from a container
$ docker run --rm alpine:3.20.3 cat /etc/alpine-release
3.20.3
```

`docker run` created a container from the image, started the command `echo` inside it, waited for it to finish, and — because of `--rm` — deleted the container afterwards. The second command read a file that exists in the image, not on your machine: `/etc/alpine-release` is Alpine's, even if your computer runs something else entirely.

### 2. What a Container Actually Is

A container is not a small virtual machine. There is no second kernel and no boot. It is an ordinary process on your machine's Linux kernel, started with two kinds of restriction:

- **Namespaces** change what the process can *see*: its own process list, its own hostname, its own network interfaces, its own view of the filesystem.
- **Control groups** (cgroups) limit what it can *use*: CPU, memory, number of processes.

The process-list namespace is easy to observe. Inside a container, the command you ran is process 1, and it is alone:

```console
$ docker run --rm alpine:3.20.3 sh -c 'echo "my PID is $$"'
my PID is 1
$ docker run --rm alpine:3.20.3 ps -o pid,comm
PID   COMMAND
    1 ps
```

On your machine, the same process has an ordinary, large PID among hundreds of others. The container sees only itself because its PID namespace starts empty.

The kernel, on the other hand, is shared. `uname -r` prints the kernel version, and a container prints the *host's*:

```console
$ [ "$(docker run --rm alpine:3.20.3 uname -r)" = "$(docker info --format '{{.KernelVersion}}')" ] && echo "same kernel as the Docker host"
same kernel as the Docker host
```

That is the whole difference from a virtual machine, and it explains both halves of Docker's reputation: containers start in milliseconds because nothing boots, and a Linux container needs a Linux kernel — on macOS and Windows, Docker Desktop runs one in a small hidden virtual machine.

### 3. Exit Status

A container's exit status is its main process's exit status, and `docker run` passes it through, so scripts can react to it exactly as they would to a local command:

```console
$ docker run --rm alpine:3.20.3 sh -c 'exit 3'
$ echo $?
3
$ docker run --rm alpine:3.20.3 false
$ echo $?
1
```

Docker uses a few codes of its own for failures that happen before your command runs:

```console
$ docker run --rm alpine:3.20.3 no-such-command 2>/dev/null
$ echo $?
127
```

(The error itself, hidden here with `2>/dev/null` because its wording changes between Docker versions, ends with `executable file not found in $PATH`.) `127` means "command not found", the same convention shells use. (`125` means `docker run` itself failed — a bad flag, say — and `126` that the command exists but could not be executed.)

### 4. The Lifecycle

`docker run` is a shortcut for two steps, *create* and *start*. Doing them separately shows the states a container passes through. `--name` gives the container a name to use instead of its random ID:

```console
$ docker create --name lifecycle alpine:3.20.3 sleep 300
[...]
$ docker inspect --format '{{.State.Status}}' lifecycle
created
$ docker start lifecycle
lifecycle
$ docker inspect --format '{{.State.Status}}' lifecycle
running
```

`docker create` prints the new container's ID, a random 64-character hex string — the `[...]` stands for it, since yours will differ. The container exists but nothing runs in it: `created`. `docker start` starts its process: `running`.

`docker ps` lists running containers. Its default table includes columns such as "Created 3 seconds ago", so here it is asked, with `--format`, for just the name and the state:

```console
$ docker ps --filter name=lifecycle --format '{{.Names}}: {{.State}}'
lifecycle: running
```

### 5. Looking Inside: `exec` and `logs`

`docker exec` runs an *additional* process inside a running container, in the same namespaces. It is how you get a shell in a container to look around:

```console
$ docker exec lifecycle ps -o pid,comm
PID   COMMAND
    1 sleep
[...] ps
```

The container's main process, `sleep`, is still PID 1; `ps` is a second process that joined it. (Its PID, elided as `[...]`, is a small number that varies from run to run.) Interactive use is `docker exec -it lifecycle sh` — `-i` keeps input open and `-t` allocates a terminal.

A container's output is captured by Docker whether or not anyone is watching. Run a container in the background with `-d` (detached), and read its output later with `docker logs`:

```console
$ docker run -d --name counter alpine:3.20.3 sh -c 'for i in 1 2 3; do echo "tick $i"; done; sleep 300'
[...]
$ until [ "$(docker logs counter | wc -l)" -ge 3 ]; do sleep 0.2; done
$ docker logs counter
tick 1
tick 2
tick 3
```

### 6. Stopping, and the Ten-Second Wait

`docker stop` asks a container's main process to exit by sending it `SIGTERM`, waits (ten seconds by default), and then kills it with `SIGKILL`. Here the wait is shortened to two seconds with `-t 2`:

```console
$ docker stop -t 2 lifecycle
lifecycle
$ docker inspect --format '{{.State.Status}} {{.State.ExitCode}}' lifecycle
exited 137
```

It took the full two seconds and ended with exit code **137** — which is 128 + 9, the number of `SIGKILL`. The `SIGTERM` was ignored. That is not because `sleep` ignores it; it is because `sleep` is **PID 1**. The kernel does not apply the default "terminate" action of a signal to PID 1 of a namespace — PID 1 only dies of a signal it has explicitly chosen to handle. An ordinary program that never installed a handler therefore cannot be stopped politely when it is PID 1, and every `docker stop` waits out the full timeout.

`--init` puts a tiny init process in front as PID 1. It forwards signals to your program, which is now an ordinary process and dies of `SIGTERM` as usual:

```console
$ docker run -d --init --name polite alpine:3.20.3 sleep 300
[...]
$ docker stop -t 2 polite
polite
$ docker inspect --format '{{.State.Status}} {{.State.ExitCode}}' polite
exited 143
```

Exit code **143** is 128 + 15, `SIGTERM`: the process was asked to stop and did, immediately. Lesson 4 comes back to this, because the way a `Dockerfile` writes its `CMD` decides whether your application is PID 1.

### 7. Removing Containers

A stopped container still exists, with its filesystem and its logs, until it is removed:

```console
$ docker ps -a --filter name=lifecycle --format '{{.Names}}: {{.State}}'
lifecycle: exited
$ docker rm lifecycle polite
lifecycle
polite
$ docker rm counter 2>/dev/null || echo "refused: counter is still running"
refused: counter is still running
$ docker rm -f counter
counter
$ docker ps -a --filter name=lifecycle --format '{{.Names}}: {{.State}}'
```

`docker rm` refuses to remove a running container; `-f` stops it (with `SIGKILL`, no grace period) and removes it. The last command prints nothing: the container is gone. `--rm` on `docker run` does this automatically when the container exits, which is why every one-off command in this lesson used it.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Prove the Filesystem Is the Container's Own

Create a file in one container, then show that a second container from the same image does not have it.

**Solution:**

```console
$ docker run --rm alpine:3.20.3 sh -c 'echo scribble > /tmp/note && cat /tmp/note'
scribble
$ docker run --rm alpine:3.20.3 cat /tmp/note
cat: can't open '/tmp/note': No such file or directory
$ echo $?
1
```

Each container gets its own writable layer on top of the image. The first container's `/tmp/note` lived in its layer, and `--rm` deleted that layer along with the container. Lesson 2 looks at those layers, and lesson 5 at how to keep data beyond a container's life.

### Exercise 2: How Long Does Each Stop Take?

Measure `docker stop -t 3` on a plain `sleep` and on `sleep` behind `--init`, in milliseconds with `date +%s%N`.

**Solution:**

```console
$ docker run -d --name plain alpine:3.20.3 sleep 300
[...]
$ docker run -d --init --name wrapped alpine:3.20.3 sleep 300
[...]
$ start=$(date +%s%N); docker stop -t 3 plain >/dev/null; ms=$(( ($(date +%s%N) - start) / 1000000 )); [ $ms -ge 3000 ] && echo "plain: waited the full 3 s"
plain: waited the full 3 s
$ start=$(date +%s%N); docker stop -t 3 wrapped >/dev/null; ms=$(( ($(date +%s%N) - start) / 1000000 )); [ $ms -lt 1000 ] && echo "wrapped: stopped in under 1 s"
wrapped: stopped in under 1 s
$ docker rm plain wrapped
plain
wrapped
```

The plain one waits out the whole timeout; the wrapped one stops at once. In a deployment that restarts dozens of containers, that is the difference between a quick rollout and a slow one — and between a clean shutdown and one where the program never got the chance to finish its work.

## 🔑 Key Points to Remember

- A container is a process on the host's kernel, isolated by namespaces and limited by cgroups. No second kernel boots.
- `docker run` = `create` + `start`; `--rm` removes the container when it exits; `-d` runs it in the background.
- A container's exit status is its main process's. `125`, `126`, `127` are Docker's and the shell's own failures.
- `docker exec` adds a process to a running container; `docker logs` shows what it has printed.
- PID 1 ignores signals it does not handle. That is why `docker stop` on a naive program waits the full timeout and ends with 137; `--init` fixes it, and so does an application that handles `SIGTERM`.

## 📝 Homework

1. Run `docker run --rm alpine:3.20.3 cat /proc/1/cgroup` and `docker run --rm --memory 64m alpine:3.20.3 cat /sys/fs/cgroup/memory.max` (or `/sys/fs/cgroup/memory/memory.limit_in_bytes` on older hosts). What do the numbers mean?
2. `docker run --rm alpine:3.20.3 hostname` prints something different each time. What is it, and where else have you seen it?
3. Find out what `docker run --restart on-failure:3 alpine:3.20.3 sh -c 'exit 1'` does, using `docker inspect --format '{{.RestartCount}}'`.
