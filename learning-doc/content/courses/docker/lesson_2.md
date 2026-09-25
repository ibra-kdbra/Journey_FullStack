# Lesson 2: Images and Layers

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Explain what an image is: a stack of read-only layers plus a little configuration
- Tell a tag from a digest, and say which one to deploy
- See copy-on-write at work with `docker diff`
- Show that images share layers instead of copying them
- Read an image's history and configuration with `docker history` and `docker image inspect`

## 📝 Detailed Content

### 1. An Image Is Layers Plus Configuration

An image is two things:

1. **A stack of read-only filesystem layers.** Each layer is a set of file changes — files added, changed or deleted — relative to the layer below it. Stacked together they form the container's root filesystem.
2. **A configuration document**: which command to run by default, environment variables, the working directory, the user, and the list of layers.

Alpine, pulled in lesson 1, is small enough to have a single layer:

```console
$ docker image inspect --format 'OS: {{.Os}}, layers: {{len .RootFS.Layers}}' alpine:3.20.3
OS: linux, layers: 1
$ docker image inspect --format 'Cmd: {{json .Config.Cmd}}' alpine:3.20.3
Cmd: ["/bin/sh"]
$ docker image inspect --format 'Env: {{json .Config.Env}}' alpine:3.20.3
Env: ["PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"]
```

`Cmd` is why `docker run -it alpine:3.20.3` with no command gives you a shell: the image says to run `/bin/sh` unless told otherwise. `docker image inspect` prints a large JSON document; `--format` takes a Go template and picks fields out of it, which is how these lessons keep output short and exact.

### 2. Tags and Digests

`alpine:3.20.3` is a **tag**: a human-readable name that a publisher can move to point at a different image at any time. `alpine:latest` moves with every release; even a precise-looking tag like `3.20.3` can be re-pushed, for example to rebuild with security fixes.

A **digest** is a content hash. It names exactly one image and can never be moved:

```console
$ docker image inspect --format '{{index .RepoDigests 0}}' alpine:3.20.3
alpine@sha256:1e42bbe2508154c9126d48c2b8a75420c3544343bf86fd041fb7527e017a4b4a
```

Anyone, anywhere, who pulls `alpine@sha256:1e42bbe2…` gets byte-for-byte the same image, and Docker verifies that it did. That is why deployments that must be reproducible pin by digest:

```console
$ docker run --rm alpine@sha256:1e42bbe2508154c9126d48c2b8a75420c3544343bf86fd041fb7527e017a4b4a cat /etc/alpine-release
3.20.3
```

This digest names an *image index* — one entry per CPU architecture — so it is the same on an Intel machine and on Apple Silicon, while each machine runs the variant built for it.

A tag is just a pointer, and you can add your own:

```console
$ docker tag alpine:3.20.3 my-alpine:stable
$ docker image ls --format '{{.Repository}}:{{.Tag}}' --filter reference='my-alpine'
my-alpine:stable
$ [ "$(docker image inspect --format '{{index .RepoDigests 0}}' my-alpine:stable)" = "$(docker image inspect --format '{{index .RepoDigests 0}}' alpine:3.20.3)" ] && echo "one image, two names"
one image, two names
$ docker rmi my-alpine:stable
Untagged: my-alpine:stable
```

`docker rmi` on a tag that shares its image with another tag only removes the name — "Untagged" — and leaves the image in place.

### 3. Copy-on-Write

A container adds one more layer on top of its image: a thin **writable** layer, private to that container. Reading a file finds it in the highest layer that has it. Changing a file from the image first copies it up into the writable layer; deleting one records a "whiteout" that hides it. The image's layers are never modified.

`docker diff` lists what a container has changed, relative to its image:

```console
$ docker run --name scratchpad alpine:3.20.3 sh -c 'echo hi > /root/hello; rm /etc/motd; mkdir /data'
$ docker diff scratchpad | sort -k2
A /data
C /etc
D /etc/motd
C /root
A /root/hello
```

`A` added, `C` changed, `D` deleted. `/root` and `/etc` show as changed because a directory changes when an entry is added to or removed from it. The image is untouched, which is why every new container from it starts clean:

```console
$ docker run --rm alpine:3.20.3 ls /etc/motd
/etc/motd
```

### 4. Images Share Layers

`docker commit` turns a container's writable layer into a new read-only layer on top of its image, creating a new image. It prints the new image's ID, a hash that differs every time:

```console
$ docker commit scratchpad with-hello
[...]
$ docker image inspect --format 'layers: {{len .RootFS.Layers}}' with-hello
layers: 2
$ docker run --rm with-hello cat /root/hello
hi
```

Two layers: Alpine's, and the one holding our changes. Alpine's layer was not copied — the new image *refers* to it:

```console
$ [ "$(docker image inspect --format '{{index .RootFS.Layers 0}}' with-hello)" = "$(docker image inspect --format '{{index .RootFS.Layers 0}}' alpine:3.20.3)" ] && echo "same bottom layer, stored once"
same bottom layer, stored once
```

This is why pulling a second image built on the same base is fast, and why ten containers from one image cost little more disk than one: layers are stored once and shared, and each container pays only for its own writable layer.

### 5. History

`docker history` lists an image's layers from the top down, with the instruction that created each one:

```console
$ docker history --format '{{.CreatedBy}}' with-hello
sh -c echo hi > /root/hello; rm /etc/motd; m…
CMD ["/bin/sh"]
ADD alpine-minirootfs-3.20.3-[...].tar.gz /…
```

The top entry is our commit — the command the container ran. Below it is Alpine's own history: a `CMD` (configuration only, no files) and an `ADD` of the Alpine root filesystem archive, whose name includes your CPU architecture — `x86_64` on an Intel or AMD machine, `aarch64` on Apple Silicon, which is why the transcript shows it as `[...]`. The `…` is Docker truncating long lines; `--no-trunc` shows them in full.

`docker commit` is useful for seeing how images work and occasionally for debugging, but it is not how images should be made: nobody can tell, later, how that layer came to contain what it does. Lesson 3 builds images from a `Dockerfile` instead, where every layer is described by an instruction you can read and rebuild.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Deleting Does Not Shrink

Make a container that writes a 10 MB file and then deletes it, commit it, and compare the size of the result with an image where the file was never written. Use `docker image inspect --format '{{.Size}}'`, which prints bytes.

**Solution:**

```console
$ docker run --name write-delete alpine:3.20.3 sh -c 'head -c 10000000 /dev/urandom > /big; rm /big'
$ docker run --name write-keep alpine:3.20.3 sh -c 'head -c 10000000 /dev/urandom > /big'
$ docker commit write-delete after-delete >/dev/null
$ docker commit write-keep after-keep >/dev/null
$ docker diff write-delete
$ keep=$(docker image inspect --format '{{.Size}}' after-keep); del=$(docker image inspect --format '{{.Size}}' after-delete); [ $(( keep - del )) -ge 9000000 ] && echo "the kept file adds about 10 MB; the deleted one adds nothing"
the kept file adds about 10 MB; the deleted one adds nothing
```

In a single container, write-then-delete leaves nothing behind: the file came and went inside the same writable layer. But the moment a file is committed into a layer, no later layer can reclaim that space — a deletion above it only hides it. Lesson 3 shows where this bites: every `RUN` in a `Dockerfile` is a commit.

### Exercise 2: What Does a Container Cost?

Start three containers from `with-hello` and show how many bytes each one's own writable layer holds. `docker inspect --size` computes it as `SizeRw`.

**Solution:**

```console
$ for n in 1 2 3; do docker run -d --name hello-$n with-hello sleep 300 >/dev/null; done
$ for n in 1 2 3; do rw=$(docker inspect --size --format '{{.SizeRw}}' hello-$n); [ "$rw" -lt 65536 ] && echo "hello-$n: own layer under 64 KB"; done
hello-1: own layer under 64 KB
hello-2: own layer under 64 KB
hello-3: own layer under 64 KB
$ docker rm -f hello-1 hello-2 hello-3 >/dev/null
```

Each container's own layer is essentially empty — a few kilobytes of directory metadata at most, the exact figure depending on your Docker storage backend. The image's layers are shared by all three, and paid for once.

## 🔑 Key Points to Remember

- An image is a stack of read-only layers plus a configuration (default command, environment, user…).
- Tags are movable names; digests are content hashes that identify exactly one image. Pin digests when you need reproducibility.
- Containers write to a private copy-on-write layer; the image never changes.
- Layers are shared between images and containers, not copied.
- A file deleted in a later layer still takes up space in the layer that added it.

## 📝 Homework

1. Run `docker image inspect alpine:3.20.3` without `--format` and find the fields used in this lesson in the JSON.
2. Pull `redis:7.0.15-alpine3.20` and compare the bottom layer of its `RootFS.Layers` with Alpine's. What does that tell you about how the Redis image was built?
3. Why does `docker diff` show `C /root` when only `/root/hello` was added?
