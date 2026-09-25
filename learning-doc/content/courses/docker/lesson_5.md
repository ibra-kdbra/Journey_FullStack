# Lesson 5: Data That Outlives Containers

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Explain why data written in a container disappears, and when that is what you want
- Keep data in named volumes, and share it between containers
- Mount host directories with bind mounts, read-only where possible
- Predict who owns files a container writes into a bind mount
- Make a container's own filesystem read-only, with `tmpfs` for scratch space

## 📝 Detailed Content

### 1. The Writable Layer Is Disposable

Lesson 2 showed that a container writes into its own copy-on-write layer. That layer is deleted with the container:

```console
$ docker run --name writer alpine:3.20.3 sh -c 'echo "important" > /data.txt'
$ docker cp writer:/data.txt - | tar -xO
important
$ docker rm writer >/dev/null
$ docker run --rm alpine:3.20.3 cat /data.txt
cat: can't open '/data.txt': No such file or directory
```

While the container exists — even stopped — its data is there (`docker cp` copies files out of any container, running or not; with `-` as the destination it writes a tar stream, unpacked here with `tar -xO`). Once it is removed, the data is gone. That is a feature: containers are meant to be replaceable, so that deploying a new version means throwing the old container away. Anything that must survive a replacement — a database's files, uploads — has to live outside the container. Docker offers two places.

### 2. Named Volumes

A **volume** is storage managed by Docker, independent of any container. `-v name:/path` mounts it; Docker creates it on first use:

```console
$ docker volume create notes
notes
$ docker run --rm -v notes:/data alpine:3.20.3 sh -c 'echo "first note" >> /data/notes.txt'
$ docker run --rm -v notes:/data alpine:3.20.3 sh -c 'echo "second note" >> /data/notes.txt'
$ docker run --rm -v notes:/data alpine:3.20.3 cat /data/notes.txt
first note
second note
```

Three containers, each removed as soon as it finished, and the notes accumulated: the volume outlives them all. Two containers can mount the same volume at once, which is how a sidecar reads a web server's logs, for example.

Volumes have one convenient behaviour worth knowing about. When an **empty** volume is mounted over a directory that has content in the image, Docker first copies that content into the volume:

```dockerfile [seeded/Dockerfile]
FROM alpine:3.20.3
RUN mkdir /config && echo "default=true" > /config/app.conf
```

```console
$ cd seeded
$ docker build -q -t seeded . >/dev/null
$ docker run --rm -v seeded-config:/config seeded cat /config/app.conf
default=true
$ docker run --rm -v seeded-config:/config alpine:3.20.3 cat /config/app.conf
default=true
```

The second container uses plain Alpine, which has no `/config` at all, yet the file is there — it now lives in the volume. This is how a database image's initial files end up in the volume you give it.

`docker volume ls` and `docker volume rm` manage volumes. A volume is never removed with a container unless you ask (`docker rm -v`, or `--rm` for volumes that were created anonymously), so deleting a container can never lose your database — and forgotten volumes can quietly fill a disk.

```console
$ docker volume ls --filter name=notes --format '{{.Name}} ({{.Driver}})'
notes (local)
$ docker volume rm notes seeded-config
notes
seeded-config
```

### 3. Bind Mounts

A **bind mount** mounts a directory from the host into the container. `-v` with an absolute host path makes one (`$PWD` is the current directory):

```text [site/index.html]
<h1>version 1</h1>
```

```console
$ cd ..
$ docker run --rm -v "$PWD/site:/site" alpine:3.20.3 cat /site/index.html
<h1>version 1</h1>
$ echo "<h1>version 2</h1>" > site/index.html
$ docker run --rm -v "$PWD/site:/site" alpine:3.20.3 cat /site/index.html
<h1>version 2</h1>
```

The container sees the host's files live, which makes bind mounts the tool for development: edit on the host, and the running container sees the change. It also means the container can change *your* files. If it has no reason to, say so with `:ro`:

```console
$ docker run --rm -v "$PWD/site:/site:ro" alpine:3.20.3 sh -c 'echo defaced > /site/index.html'
sh: can't create /site/index.html: Read-only file system
$ cat site/index.html
<h1>version 2</h1>
```

Unlike an empty named volume, a bind mount is never seeded from the image: it simply hides whatever the image had at that path.

### 4. Who Owns the Files?

A bind mount shares files, and file ownership is just a number. A container running as root writes files owned by UID 0 — on the host, too:

```console
$ docker run --rm -v "$PWD/site:/site" alpine:3.20.3 touch /site/by-container
$ stat -c 'owner uid: %u' site/by-container
owner uid: 0
```

If you are not root on the host, you may now be unable to delete that file without `sudo`. Running the container with your own UID and GID avoids it:

```console
$ docker run --rm --user "$(id -u):$(id -g)" -v "$PWD/site:/site" alpine:3.20.3 touch /site/by-me
$ [ "$(stat -c %u site/by-me)" = "$(id -u)" ] && echo "owned by the host user who ran it"
owned by the host user who ran it
```

(The container runs as a UID that may have no name inside it — which is fine; the kernel only cares about the number.)

### 5. A Read-Only Container

The opposite discipline: a container whose own filesystem cannot be written at all. `--read-only` makes the root filesystem read-only; `--tmpfs` adds an in-memory directory for the scratch space a program still needs:

```console
$ docker run --rm --read-only alpine:3.20.3 touch /etc/tampered
touch: /etc/tampered: Read-only file system
$ docker run --rm --read-only --tmpfs /tmp alpine:3.20.3 sh -c 'echo scratch > /tmp/work && cat /tmp/work'
scratch
```

An attacker who gets code execution in such a container cannot modify its binaries or leave files behind; everything the application may write is spelled out — a volume for data, a `tmpfs` for scratch. Data in a `tmpfs` lives in memory and disappears with the container.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Back Up and Restore a Volume

Volumes are managed by Docker, so you back them up *through* a container: mount the volume and a host directory into one container, and archive from one to the other. Back up a volume, delete it, and restore it into a new one.

**Solution:**

```console
$ docker run --rm -v journal:/data alpine:3.20.3 sh -c 'echo "day 1" > /data/day1.txt; echo "day 2" > /data/day2.txt'
$ mkdir -p backups
$ docker run --rm -v journal:/data:ro -v "$PWD/backups:/backup" alpine:3.20.3 tar -czf /backup/journal.tgz -C /data .
$ docker volume rm journal
journal
$ docker run --rm -v journal-restored:/data -v "$PWD/backups:/backup:ro" alpine:3.20.3 tar -xzf /backup/journal.tgz -C /data
$ docker run --rm -v journal-restored:/data alpine:3.20.3 sh -c 'cat /data/*.txt'
day 1
day 2
$ docker volume rm journal-restored
journal-restored
```

The volume is mounted read-only for the backup, so the backup container cannot damage what it is backing up.

### Exercise 2: Which Mount for Which Job?

For each of these, name the right kind of storage: a PostgreSQL data directory in production; your source code while developing; a cache of rendered thumbnails that can be regenerated; TLS certificates the host already has.

**Solution:**

- **Database files:** a named volume — managed by Docker, survives container replacement, not tied to a host path.
- **Source code in development:** a bind mount — you edit on the host and want the container to see it immediately.
- **Regenerable cache:** a `tmpfs` if it is small, or the container's own writable layer — losing it costs only time.
- **Host certificates:** a read-only bind mount (`:ro`) of exactly the files needed — the container must read them and has no business changing them.

## 🔑 Key Points to Remember

- A container's writable layer is deleted with the container. Treat containers as replaceable.
- Named volumes are Docker-managed storage that outlives containers; an empty one is seeded from the image.
- Bind mounts share a host path live, hide the image's content, and should be `:ro` when the container only reads.
- Files written into a bind mount keep the container user's UID; run with `--user "$(id -u):$(id -g)"` to keep host files yours.
- `--read-only` plus `--tmpfs` for scratch space leaves a compromised container nowhere to write.

## 📝 Homework

1. Run `docker volume inspect` on a volume and find where on the host its data lives. Why should you still not edit it there?
2. The long form of `-v` is `--mount type=volume,src=notes,dst=/data`. Rewrite one command from this lesson with `--mount`, and find out what `--mount` does differently from `-v` when a bind-mount source path does not exist.
3. Start a container with `-v /data` (no name). Find the volume it created with `docker volume ls`, and check what `--rm` does to it.
