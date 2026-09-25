# Lesson 4: How a Container Starts — and Stops

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Combine `ENTRYPOINT` and `CMD`, and predict what a container runs for any `docker run` arguments
- Tell the shell form of `CMD` from the exec form, and explain why the exec form matters
- Write an application that shuts down cleanly on `docker stop`
- Run a container as a non-root user with `USER`

## 📝 Detailed Content

### 1. `ENTRYPOINT` and `CMD`

Two instructions decide what a container runs:

- `ENTRYPOINT` is the executable.
- `CMD` supplies default *arguments* to it — or, when there is no `ENTRYPOINT`, the whole default command.

Anything you write after the image name in `docker run` replaces `CMD`, never `ENTRYPOINT`. That makes images that behave like a command:

```dockerfile [greeter/Dockerfile]
FROM alpine:3.20.3
ENTRYPOINT ["echo", "Hello,"]
CMD ["world"]
```

```console
$ cd greeter
$ docker build -q -t greeter . >/dev/null
$ docker run --rm greeter
Hello, world
$ docker run --rm greeter Docker
Hello, Docker
$ docker run --rm greeter there, "how are you?"
Hello, there, how are you?
```

To replace the entrypoint itself, say so explicitly:

```console
$ docker run --rm --entrypoint cat greeter /etc/alpine-release
3.20.3
```

`docker image inspect` shows both halves:

```console
$ docker image inspect --format 'Entrypoint={{json .Config.Entrypoint}} Cmd={{json .Config.Cmd}}' greeter
Entrypoint=["echo","Hello,"] Cmd=["world"]
```

### 2. Exec Form and Shell Form

Both instructions can be written two ways:

| Form | Example | What runs as PID 1 |
|---|---|---|
| exec form (JSON array) | `CMD ["./app.sh"]` | `./app.sh` itself |
| shell form (plain string) | `CMD ./app.sh` | `/bin/sh -c "./app.sh"` |

The shell form lets you use shell features — variables, `&&`, pipes — at the price of putting a shell in front of your program. Docker records it that way:

```dockerfile [forms/Dockerfile]
FROM alpine:3.20.3
CMD echo "started at $HOME" && sleep 300; echo "stopped"
```

```console
$ cd ../forms
$ docker build -q -t forms . >/dev/null
$ docker image inspect --format '{{json .Config.Cmd}}' forms
["/bin/sh","-c","echo \"started at $HOME\" && sleep 300; echo \"stopped\""]
$ docker run -d --name forms forms >/dev/null
$ docker exec forms ps -o pid,args | head -2
PID   COMMAND
    1 /bin/sh -c echo "started at $HOME" && sleep 300; echo "stopped"
$ docker rm -f forms >/dev/null
```

PID 1 is the shell, and `sleep` runs as its child. (Alpine's shell is clever enough to `exec` a lone final command instead of forking it, so a shell-form `CMD` that is a single command may end up as PID 1 after all — homework 1. With anything after it, as here, the shell has to stay.)

### 3. Why It Matters: Signals

Lesson 1 showed that `docker stop` sends `SIGTERM` to PID 1, and that PID 1 only reacts to signals it handles. Here is an application that does handle it — it cleans up and exits on `SIGTERM`:

```sh [signals/app.sh]
#!/bin/sh
cleanup() {
  echo "SIGTERM received: finishing work and exiting"
  exit 0
}
trap cleanup TERM
echo "app started"
while true; do sleep 1; done
```

Built twice — once with the exec form, once with a shell form that runs something after the app. The `until` loop waits for both to log that they have started, so that the trap is in place before the signal arrives:

```dockerfile [signals/Dockerfile.exec]
FROM alpine:3.20.3
COPY app.sh /app.sh
RUN chmod +x /app.sh
CMD ["/app.sh"]
```

```dockerfile [signals/Dockerfile.shell]
FROM alpine:3.20.3
COPY app.sh /app.sh
RUN chmod +x /app.sh
CMD /app.sh; echo "app exited"
```

```console
$ cd ../signals
$ docker build -q -t signals-exec -f Dockerfile.exec . >/dev/null
$ docker build -q -t signals-shell -f Dockerfile.shell . >/dev/null
$ docker run -d --name via-exec signals-exec >/dev/null
$ docker run -d --name via-shell signals-shell >/dev/null
$ until docker logs via-exec | grep -q started && docker logs via-shell | grep -q started; do sleep 0.2; done
$ docker stop -t 3 via-exec via-shell
via-exec
via-shell
$ docker inspect --format '{{.Name}} exited {{.State.ExitCode}}' via-exec via-shell
/via-exec exited 0
/via-shell exited 137
$ docker logs via-exec
app started
SIGTERM received: finishing work and exiting
$ docker logs via-shell
app started
```

- **Exec form:** the app is PID 1, receives `SIGTERM`, runs its cleanup and exits with status 0 — immediately.
- **Shell form:** the shell is PID 1. It does not pass `SIGTERM` on to its child, and as PID 1 it does not die of it either. The app never hears anything; after three seconds both are killed with `SIGKILL` (137), and the cleanup never runs.

In production, "cleanup" means finishing in-flight requests, flushing buffers, closing database connections. With the shell form, every deploy kills your application mid-request.

The fixes, in order of preference: use the exec form; if you need a shell to set things up, end the script with `exec your-app` so the app *replaces* the shell as PID 1; or run with `--init` (lesson 1) so a real init forwards signals.

### 4. Running as a Non-Root User

Unless told otherwise, the process in a container runs as root — root inside the container's namespaces, but still UID 0 as far as the kernel is concerned, which matters if the process ever escapes its isolation or is given access to host files. `USER` changes that for everything after it, including the container:

```dockerfile [nonroot/Dockerfile]
FROM alpine:3.20.3
RUN adduser -D -u 10001 app
WORKDIR /home/app
USER app
CMD ["id"]
```

```console
$ cd ../nonroot
$ docker build -q -t nonroot . >/dev/null
$ docker run --rm nonroot
uid=10001(app) gid=10001(app) groups=10001(app)
$ docker run --rm nonroot touch /etc/should-not-work
touch: /etc/should-not-work: Permission denied
$ docker run --rm nonroot sh -c 'touch notes.txt && ls'
notes.txt
$ docker run --rm alpine:3.20.3 id
uid=0(root) gid=0(root) groups=0(root),0(root),1(bin),2(daemon),3(sys),4(adm),6(disk),10(wheel),11(floppy),20(dialout),26(tape),27(video)
```

The application can write to its own home directory and nowhere it should not. `docker run --user` overrides `USER` for one container, which is also how you find out whether an image works as non-root before changing its `Dockerfile`.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: A Setup Script That Keeps Signals Working

An app needs a setup step before it starts — here, writing a config file. Write an entrypoint script that does the setup and then starts `/app.sh` so that it still receives `SIGTERM`.

**Solution:** end the script with `exec`, which replaces the shell with the app instead of starting it as a child.

```sh [exec/entrypoint.sh]
#!/bin/sh
echo "setting up" 
echo "mode=production" > /tmp/app.conf
exec /app.sh
```

```sh [exec/app.sh]
#!/bin/sh
trap 'echo "SIGTERM received: finishing work and exiting"; exit 0' TERM
echo "app started with $(cat /tmp/app.conf)"
while true; do sleep 1; done
```

```dockerfile [exec/Dockerfile]
FROM alpine:3.20.3
COPY entrypoint.sh app.sh /
RUN chmod +x /entrypoint.sh /app.sh
ENTRYPOINT ["/entrypoint.sh"]
```

```console
$ cd ../exec
$ docker build -q -t exec-demo . >/dev/null
$ docker run -d --name exec-demo exec-demo >/dev/null
$ until docker logs exec-demo | grep -q started; do sleep 0.2; done
$ docker exec exec-demo ps -o pid,args | head -2
PID   COMMAND
    1 {app.sh} /bin/sh /app.sh
$ docker stop -t 3 exec-demo >/dev/null
$ docker inspect --format 'exited {{.State.ExitCode}}' exec-demo
exited 0
$ docker logs exec-demo
setting up
app started with mode=production
SIGTERM received: finishing work and exiting
```

After `exec`, PID 1 is the app, not the entrypoint script, and the shutdown is clean.

### Exercise 2: Pass Arguments Through an Entrypoint

Make an image where `docker run image a b c` prints `args: a b c`, and plain `docker run image` prints `args: none`.

**Solution:**

```dockerfile [args/Dockerfile]
FROM alpine:3.20.3
ENTRYPOINT ["sh", "-c", "echo \"args: ${*:-none}\"", "--"]
```

```console
$ cd ../args
$ docker build -q -t args-demo . >/dev/null
$ docker run --rm args-demo a b c
args: a b c
$ docker run --rm args-demo
args: none
```

With `sh -c`, the word after the script (`--`) becomes `$0` and the rest become `$1`, `$2`…, so the `docker run` arguments arrive as the script's positional parameters. There is no `CMD`, so with no arguments `$*` is empty and the default applies.

## 🔑 Key Points to Remember

- `ENTRYPOINT` is the executable, `CMD` its default arguments; `docker run image args…` replaces `CMD` only.
- Exec form (`["a", "b"]`) runs your program as PID 1; shell form (`a b`) runs `/bin/sh -c` as PID 1.
- A shell as PID 1 does not forward `SIGTERM`: your app never gets to shut down cleanly and is killed after the timeout.
- In entrypoint scripts, start the app with `exec`.
- Add a user and switch to it with `USER`; do not run applications as root.

## 📝 Homework

1. Change `signals/Dockerfile.shell` to `CMD /app.sh` (shell form, nothing after it) and repeat the experiment. Alpine's shell happens to `exec` a lone command itself — check with `docker exec … ps`. Why is relying on that fragile?
2. Add `STOPSIGNAL SIGINT` to a Dockerfile and trap `INT` instead of `TERM`. What does `docker stop` send now?
3. What happens if `USER app` comes before a `RUN apk add …` line? Try it.
