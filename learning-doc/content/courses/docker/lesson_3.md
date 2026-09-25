# Lesson 3: Building Images with a Dockerfile

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Write a `Dockerfile` with `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV` and `CMD`
- Explain the build context, and keep files out of it with `.dockerignore`
- Predict which steps the build cache reuses, and order instructions so that it reuses the expensive ones
- Explain why deleting a file in a later `RUN` does not make an image smaller

## 📝 Detailed Content

### 1. A First Dockerfile

A `Dockerfile` is a list of instructions, each of which produces one step of the image: a filesystem layer, a configuration change, or both. Create a directory `hello` with a small script and a `Dockerfile` next to it:

```sh [hello/greet.sh]
#!/bin/sh
echo "Hello, ${GREETING_NAME}! This is $(cat /etc/alpine-release)."
```

```dockerfile [hello/Dockerfile]
FROM alpine:3.20.3
WORKDIR /app
COPY greet.sh .
RUN chmod +x greet.sh
ENV GREETING_NAME=world
CMD ["./greet.sh"]
```

Line by line:

- `FROM` names the base image: its layers are the bottom of ours.
- `WORKDIR` sets the directory later instructions — and the container — work in, creating it if needed.
- `COPY` copies files from the build context (below) into the image: a new layer.
- `RUN` runs a command *at build time*, in a temporary container, and commits the result: a new layer.
- `ENV` sets an environment variable, both for later build steps and for containers.
- `CMD` is the default command when a container starts. It changes configuration only, no files.

Build it (the `alpine:3.20.3` base was pulled in lesson 1). `-t` names the result; `-q` prints only the new image's ID, which differs on every build, instead of the step-by-step progress display:

```console
$ cd hello
$ docker build -q -t hello .
[...]
$ docker run --rm hello
Hello, world! This is 3.20.3.
$ docker run --rm -e GREETING_NAME=Docker hello
Hello, Docker! This is 3.20.3.
```

`-e` overrides an `ENV` default for one container: the image stays the same, the environment is the container's.

`docker history` shows one entry per instruction. Entries whose instruction only changed configuration add no files:

```console
$ docker history --format '{{.CreatedBy}}' hello | head -6
CMD ["./greet.sh"]
ENV GREETING_NAME=world
RUN /bin/sh -c chmod +x greet.sh # buildkit
COPY greet.sh . # buildkit
WORKDIR /app
CMD ["/bin/sh"]
```

(Build steps are marked `# buildkit`, the name of Docker's build engine.)

### 2. The Build Context

The `.` at the end of `docker build -q -t hello .` is the **build context**: the directory whose contents are sent to the builder. `COPY` can only copy from the context, so `COPY ../secrets.txt .` is an error — and everything in the context is uploaded to the builder, whether a `COPY` uses it or not.

`COPY . .` copies all of it, which is convenient and dangerous:

```text [context/app.sh]
echo "the app"
```

```text [context/.env]
DATABASE_PASSWORD=hunter2
```

```dockerfile [context/Dockerfile]
FROM alpine:3.20.3
WORKDIR /app
COPY . .
```

```console
$ cd ../context
$ docker build -q -t leaky . >/dev/null
$ docker run --rm leaky ls -A /app
.env
Dockerfile
app.sh
$ docker run --rm leaky cat /app/.env
DATABASE_PASSWORD=hunter2
```

The password file is now in the image, and anyone who can pull the image can read it — deleting it in a later step would only hide it (section 4). A `.dockerignore` file lists paths to leave out of the context altogether, with the same patterns as `.gitignore`:

```text [context/.dockerignore]
.env
Dockerfile
.dockerignore
```

```console
$ docker build -q -t leaky . >/dev/null
$ docker run --rm leaky ls -A /app
app.sh
```

### 3. The Build Cache

Building an image runs each instruction, and that can be slow — installing packages, compiling. So Docker keeps a **cache**: before running a step, it checks whether it has already run *the same instruction on top of the same previous layer*, and for `COPY`, with the same file contents. If so, it reuses the result. The first step that misses the cache is rebuilt, and so is every step after it, because each one's "previous layer" has changed.

To watch the cache without reading build logs, give an image a step that records when it actually ran:

```text [cache/message.txt]
first message
```

```dockerfile [cache/Dockerfile]
FROM alpine:3.20.3
RUN date +%s%N > /built-at
COPY message.txt /message.txt
CMD ["sh", "-c", "cat /message.txt"]
```

`date +%s%N` is the current time in nanoseconds: if the `RUN` step is executed again, `/built-at` changes; if it is reused from the cache, it does not.

```console
$ cd ../cache
$ docker build -q -t cache-demo . >/dev/null
$ first=$(docker run --rm cache-demo cat /built-at)
$ echo "second message" > message.txt
$ docker build -q -t cache-demo . >/dev/null
$ docker run --rm cache-demo
second message
$ [ -n "$first" ] && [ "$(docker run --rm cache-demo cat /built-at)" = "$first" ] && echo "RUN step reused from cache"
RUN step reused from cache
```

Changing `message.txt` invalidated the `COPY` step — its input changed — but not the `RUN` above it. Now put the `COPY` first, the way many Dockerfiles are written:

```dockerfile [cache-bad/Dockerfile]
FROM alpine:3.20.3
COPY message.txt /message.txt
RUN date +%s%N > /built-at
CMD ["sh", "-c", "cat /message.txt"]
```

```console
$ cd ../cache-bad
$ echo "first message" > message.txt
$ docker build -q -t cache-bad . >/dev/null
$ first=$(docker run --rm cache-bad cat /built-at)
$ echo "second message" > message.txt
$ docker build -q -t cache-bad . >/dev/null
$ [ -n "$first" ] && [ "$(docker run --rm cache-bad cat /built-at)" != "$first" ] && echo "RUN step executed again"
RUN step executed again
```

Same instructions, same change — but now the `RUN` sits *after* the step that changed, so it runs again. Imagine that `RUN` is `npm ci` or `pip install`, taking two minutes: this is the difference between a build that takes two minutes on every code change and one that takes two seconds. The rule:

> Put instructions whose inputs change rarely (installing dependencies) **before** instructions whose inputs change often (copying your source code).

For a Node.js app that means copying `package.json` and `package-lock.json`, running `npm ci`, and only then copying the rest of the source. Exercise 1 does the same shape with a stand-in for the slow step.

### 4. Every `RUN` Is a Layer

Lesson 2 showed that a file deleted in a later layer still takes up space in the layer that added it. In a `Dockerfile`, every `RUN` is a commit — so the classic mistake looks like this:

```dockerfile [layers/Dockerfile.separate]
FROM alpine:3.20.3
RUN head -c 20000000 /dev/urandom > /tmp/download
RUN rm /tmp/download
```

```dockerfile [layers/Dockerfile.combined]
FROM alpine:3.20.3
RUN head -c 20000000 /dev/urandom > /tmp/download && rm /tmp/download
```

`-f` picks a Dockerfile other than the default name:

```console
$ cd ../layers
$ docker build -q -t layers-separate -f Dockerfile.separate . >/dev/null
$ docker build -q -t layers-combined -f Dockerfile.combined . >/dev/null
$ sep=$(docker image inspect --format '{{.Size}}' layers-separate); comb=$(docker image inspect --format '{{.Size}}' layers-combined); [ $(( sep - comb )) -ge 19000000 ] && echo "separate RUNs keep the 20 MB; the combined RUN does not"
separate RUNs keep the 20 MB; the combined RUN does not
```

The separate version still carries the downloaded file in its second layer, hidden by the third. Clean up in the same `RUN` that made the mess — for example `apk add --no-cache`, or `apt-get install … && rm -rf /var/lib/apt/lists/*` on one line. Lesson 7 shows a better tool still: multi-stage builds, which leave build-time files out of the final image entirely.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Order a Dependency Install Correctly

A project has a dependency list, `deps.txt`, and source code, `app.sh`. "Installing dependencies" is slow; here a `RUN` that records its time stands in for it. Write a Dockerfile where editing `app.sh` does **not** re-run the install, but editing `deps.txt` does.

**Solution:**

```text [deps/deps.txt]
left-pad 1.3.0
```

```sh [deps/app.sh]
echo "app version 1"
```

```dockerfile [deps/Dockerfile]
FROM alpine:3.20.3
WORKDIR /app
COPY deps.txt .
RUN date +%s%N > /installed-at
COPY app.sh .
CMD ["sh", "app.sh"]
```

```console
$ cd ../deps
$ docker build -q -t deps-demo . >/dev/null
$ t1=$(docker run --rm deps-demo cat /installed-at)
$ echo 'echo "app version 2"' > app.sh
$ docker build -q -t deps-demo . >/dev/null
$ docker run --rm deps-demo
app version 2
$ [ -n "$t1" ] && [ "$(docker run --rm deps-demo cat /installed-at)" = "$t1" ] && echo "code change: install reused"
code change: install reused
$ echo "left-pad 1.3.1" > deps.txt
$ docker build -q -t deps-demo . >/dev/null
$ [ -n "$t1" ] && [ "$(docker run --rm deps-demo cat /installed-at)" != "$t1" ] && echo "dependency change: install ran again"
dependency change: install ran again
```

The install step depends only on `deps.txt`, so only a change to `deps.txt` invalidates it.

### Exercise 2: Where Is the Secret?

In section 2, suppose `.env` had been copied and then removed with `RUN rm /app/.env`. Show that the password is still recoverable from the image.

**Solution:**

```text [secret/.env]
DATABASE_PASSWORD=hunter2
```

```dockerfile [secret/Dockerfile]
FROM alpine:3.20.3
COPY .env /app/.env
RUN rm /app/.env
```

```console
$ cd ../secret
$ docker build -q -t secret-demo . >/dev/null
$ docker run --rm secret-demo ls -A /app
$ docker save secret-demo -o image.tar && mkdir unpacked && tar -xf image.tar -C unpacked
$ for layer in unpacked/blobs/sha256/*; do tar -xOf "$layer" app/.env 2>/dev/null; done
DATABASE_PASSWORD=hunter2
```

The running container cannot see the file, but the image still contains the layer that added it. `docker save` writes the image out as a tar archive holding each layer as its own archive; unpacking them one by one, the layer that `COPY` created still has `app/.env` in it, and the password comes straight back out. Never let a secret reach a layer — keep it out of the context with `.dockerignore`, and pass secrets to builds with `docker build --secret`, which mounts them for one `RUN` without writing them into any layer.

## 🔑 Key Points to Remember

- Each `Dockerfile` instruction is one build step; `RUN`, `COPY` and `ADD` add filesystem layers, others only change configuration.
- The build context is uploaded to the builder in full; `.dockerignore` keeps files, especially secrets, out of it.
- A step is reused from cache when its instruction, its inputs and everything before it are unchanged. The first changed step and all steps after it rebuild.
- Order instructions from least to most frequently changing: dependencies before source code.
- Clean up within the same `RUN`; a deletion in a later layer frees nothing.

## 📝 Homework

1. Rebuild the `hello` image with `--progress=plain` instead of `-q` and find the word `CACHED` in the output.
2. Change `WORKDIR /app` to `WORKDIR /srv` in `hello/Dockerfile` and rebuild. Which steps are rebuilt, and why?
3. Read about `ADD` in the Dockerfile reference. How does it differ from `COPY`, and why do most style guides prefer `COPY`?
