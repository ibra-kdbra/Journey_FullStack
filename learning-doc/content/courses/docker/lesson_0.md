# Docker: Images, Layers and the Container Lifecycle

Docker is usually introduced as "lightweight virtual machines", and that picture causes most of the confusion people later have with it — about why data disappears, why `docker stop` hangs for ten seconds, why an image is huge, why two containers cannot find each other. A container is not a virtual machine. It is an ordinary process, with a restricted view of the system, started from a stack of read-only filesystem layers. This course builds that picture from the ground up, and then uses it.

The course runs in one direction: what a container *is* (a process), what an image *is* (layers), how to build images well, how containers start and stop, where their data should live, how they talk to each other — and finally a complete multi-container application with Docker Compose.

## How to use this course

Every lesson is built around shell transcripts like this one:

```console
$ docker info --format '{{.OSType}}'
linux
```

The line after `$ ` is what you type; everything up to the next `$ ` is what it prints. A long command continues on a line starting with `> `, as your shell shows it.

Files the lessons use are shown with their path in the header of the block, like `hello/Dockerfile`. Create them at that path, relative to a working directory for the lesson, before running the commands that follow them.

Docker prints a few values that are random by design — the ID of a new container, of a new network, of a freshly built image. Where a transcript would show one, it shows `[...]` instead. That is the only placeholder in the course, and every other character of output is exactly what you should see.

**These transcripts are tested, not illustrative.** A verifier runs every lesson — writing its files, typing its commands into one shell, in order — against a real Docker daemon, and fails if any command prints something different. They were last verified with **Docker Engine 29.3.1** and **Docker Compose 5.1.1** on Linux (`x86_64`), and with the exact image tags the lessons pull: `alpine:3.20.3`, `python:3.12.7-alpine3.20` and `redis:7.0.15-alpine3.20`. Pinned tags are why the output can be exact; in your own projects, lesson 2 explains why you may want to pin even harder.

What the verifier does *not* cover: Docker Desktop's own features on macOS and Windows, Windows containers, and anything that depends on your machine's CPU architecture. On an Apple Silicon Mac, a few lines that name the architecture will say `aarch64`, and the lessons point these out.

### Setting up

- **Linux:** install Docker Engine and the Compose plugin from your distribution or from Docker's own packages, and add yourself to the `docker` group (or use `sudo`).
- **macOS and Windows:** install Docker Desktop, which runs the Linux kernel containers need in a small virtual machine and includes Compose.

Work in an empty directory for each lesson. The commands use `curl` in lessons 6 and 7, and `python3` in one exercise of lesson 7. Container names such as `web` and `api` are used freely; if you already run containers with those names, remove them or rename the lessons' ones. At the end, `docker container prune`, `docker volume prune` and `docker image prune -a` clean up everything the course created — along with anything else unused, so read what they will remove before confirming.

## Part 1: The Model

### Lesson 1: A Container Is a Process

**Content:**

- Running one-off commands; what `--rm`, `-d` and `--name` do
- Namespaces and cgroups: a container is an isolated process on the host's kernel, not a VM
- Exit status, and Docker's own `125`/`126`/`127`
- The lifecycle: created, running, exited, removed; `exec` and `logs`
- Why `docker stop` waits ten seconds and ends with `137`: signals and PID 1; `--init`

**Activities:**

- Prove each container's filesystem is its own
- Time `docker stop` with and without an init process

### Lesson 2: Images and Layers

**Content:**

- An image is read-only layers plus configuration
- Tags are movable names; digests identify exactly one image
- Copy-on-write, seen with `docker diff`
- Layers are shared between images and containers, not copied
- `docker history` and `docker image inspect`

**Activities:**

- Show that deleting a file in a later layer does not shrink an image
- Measure what three containers add on top of one image

## Part 2: Building

### Lesson 3: Building Images with a Dockerfile

**Content:**

- `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `CMD`
- The build context, and keeping secrets out of it with `.dockerignore`
- The build cache: which steps are reused, and ordering instructions so that expensive ones are
- Every `RUN` is a layer

**Activities:**

- Order a dependency install so that code changes do not re-run it
- Recover a "deleted" secret from an image's layers

### Lesson 4: How a Container Starts — and Stops

**Content:**

- `ENTRYPOINT` and `CMD`, and how `docker run` arguments combine with them
- Exec form versus shell form
- Clean shutdown: why a shell as PID 1 swallows `SIGTERM`
- Running as a non-root user with `USER`

**Activities:**

- A setup script that still lets the app receive signals, using `exec`
- Pass `docker run` arguments through an entrypoint

## Part 3: Running Applications

### Lesson 5: Data That Outlives Containers

**Content:**

- The writable layer is disposable
- Named volumes, and how an empty one is seeded from the image
- Bind mounts, read-only mounts, and who owns the files
- Read-only containers with `tmpfs` scratch space

**Activities:**

- Back up and restore a volume through a container
- Choose the right kind of storage for four jobs

### Lesson 6: Networking

**Content:**

- A container's own network stack, and publishing ports — on the right interface
- User-defined networks and DNS by container name
- Why the default network has no names
- Isolating groups of containers

**Activities:**

- Two services, one published port
- Look inside Docker's embedded DNS

### Lesson 7: Capstone — Small Images and a Compose Application

**Content:**

- Multi-stage builds
- A web service and Redis in one `compose.yaml`: networks, volumes, health checks, start order
- `down` versus `down -v`: what survives
- Clean shutdown across a whole application

**Activities:**

- Scale the web service to three containers sharing one counter
- Read the merged configuration with `docker compose config`
