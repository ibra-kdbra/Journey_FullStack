# Lesson 7: Capstone — Small Images and a Compose Application

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Use a multi-stage build to keep build-time files out of the image you ship
- Describe a multi-container application in a `compose.yaml`
- Start services in the right order with health checks and `depends_on`
- Keep data across `docker compose down` and `up`, and know which command deletes it
- Put every earlier lesson to work in one application

## 📝 Detailed Content

### 1. Multi-Stage Builds

Lesson 3 showed that files added in one layer cost space even if a later layer deletes them. Building software makes a lot of such files — compilers, package caches, source code, intermediate objects — none of which the running application needs.

A **multi-stage build** uses several `FROM` instructions in one `Dockerfile`. Each starts a new, independent stage; only the **last** stage becomes the image, and it takes from earlier stages only what it explicitly copies with `COPY --from`.

Here a build stage produces a small artifact, `app.txt`, and alongside it 30 MB of build-only files that stand in for a toolchain and its caches. The single-stage version ships everything; the multi-stage version ships only the artifact:

```dockerfile [multistage/Dockerfile.single]
FROM alpine:3.20.3
RUN mkdir /toolchain && head -c 30000000 /dev/urandom > /toolchain/compiler-cache \
 && echo "the finished application" > /app.txt
CMD ["cat", "/app.txt"]
```

```dockerfile [multistage/Dockerfile.multi]
FROM alpine:3.20.3 AS build
RUN mkdir /toolchain && head -c 30000000 /dev/urandom > /toolchain/compiler-cache \
 && echo "the finished application" > /app.txt

FROM alpine:3.20.3
COPY --from=build /app.txt /app.txt
CMD ["cat", "/app.txt"]
```

```console
$ cd multistage
$ docker build -q -t app-single -f Dockerfile.single . >/dev/null
$ docker build -q -t app-multi -f Dockerfile.multi . >/dev/null
$ docker run --rm app-single
the finished application
$ docker run --rm app-multi
the finished application
$ docker run --rm app-multi ls /toolchain
ls: /toolchain: No such file or directory
$ single=$(docker image inspect --format '{{.Size}}' app-single); multi=$(docker image inspect --format '{{.Size}}' app-multi); base=$(docker image inspect --format '{{.Size}}' alpine:3.20.3)
$ [ $(( single - multi )) -ge 29000000 ] && echo "multi-stage image is 30 MB smaller"
multi-stage image is 30 MB smaller
$ [ $(( multi - base )) -lt 100000 ] && echo "and adds under 100 KB to Alpine"
and adds under 100 KB to Alpine
```

The build stage still ran — it had to, to produce `app.txt` — but nothing from it reached the final image except that one file. In a real project the build stage is `FROM golang` or `FROM node` with the full toolchain, and the last stage is a minimal runtime image, or even `FROM scratch` — an empty image — for a statically linked binary.

`--target` builds only up to a named stage, which is how you get a debugging image with all the tools from the same `Dockerfile`:

```console
$ docker build -q -t app-build-stage --target build -f Dockerfile.multi . >/dev/null
$ docker run --rm app-build-stage ls /toolchain
compiler-cache
```

### 2. The Application

The rest of this lesson builds a small, complete application: a web service that counts its visits in Redis. It needs two containers, a network between them, a volume for Redis's data, and a start order — Redis must be ready before the web service handles requests.

The web service uses only Python's standard library, talking to Redis over its wire protocol directly. Note the `SIGTERM` handler from lesson 4, and the `/health` endpoint that does not count as a visit:

```python [counter/web/server.py]
import os
import signal
import socket
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

REDIS = (os.environ["REDIS_HOST"], 6379)


def incr(key):
    """INCR a Redis key and return the new value, speaking RESP directly."""
    with socket.create_connection(REDIS, timeout=2) as conn:
        conn.sendall(f"*2\r\n$4\r\nINCR\r\n${len(key)}\r\n{key}\r\n".encode())
        reply = conn.recv(64).decode()  # an integer reply looks like ":42\r\n"
    return int(reply[1:].strip())


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            body = b"ok\n"
        else:
            body = f"visits: {incr('visits')}\n".encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # keep the container's log quiet


# As PID 1, Python would ignore SIGTERM: exit cleanly on it instead.
signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
HTTPServer(("", 8000), Handler).serve_forever()
```

Its image follows lessons 3 and 4: a non-root user, the source copied last, the exec form of `CMD`:

```dockerfile [counter/web/Dockerfile]
FROM python:3.12.7-alpine3.20
RUN adduser -D -u 10001 app
WORKDIR /app
COPY server.py .
USER app
CMD ["python", "server.py"]
```

### 3. `compose.yaml`

Starting this by hand would take a `docker network create`, a `docker volume create`, two `docker build` and `docker run` commands with a dozen flags, in the right order. **Docker Compose** describes the whole application in one file and does all of it:

```yaml [counter/compose.yaml]
services:
  web:
    build: ./web
    ports:
      - "127.0.0.1:18090:8000"
    environment:
      REDIS_HOST: redis
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"]
      interval: 1s
      timeout: 3s
      retries: 30

  redis:
    image: redis:7.0.15-alpine3.20
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 1s
      timeout: 3s
      retries: 30

volumes:
  redis-data:
```

Every line maps to something from an earlier lesson:

- `services` are containers. Compose names them `<project>-<service>-1`, the project being the directory name, `counter`.
- Compose creates a network for the project, `counter_default`, and attaches every service to it — so `web` reaches Redis at the host name `redis` (lesson 6). Only `web` publishes a port, on `127.0.0.1`.
- `redis-data` is a named volume (lesson 5), mounted where Redis keeps its data; `--appendonly yes` makes Redis write every change to disk there.
- A `healthcheck` is a command Docker runs periodically inside the container; exit status 0 means healthy. `depends_on` with `condition: service_healthy` holds `web` back until `redis` passes its check — "started" is not "ready" (lesson 6 polled for the same reason).

### 4. Running It

The Redis image is new, so pull it first; then `up`. `-d` runs everything in the background, `--wait` returns only when all services are healthy, and `--progress quiet` hides the status display:

```console
$ docker pull -q redis:7.0.15-alpine3.20
docker.io/library/redis:7.0.15-alpine3.20
$ cd ../counter
$ docker compose --progress quiet up -d --build --wait
$ docker compose ps --format '{{.Service}}: {{.State}} ({{.Health}})'
redis: running (healthy)
web: running (healthy)
$ curl -s http://localhost:18090/
visits: 1
$ curl -s http://localhost:18090/
visits: 2
$ curl -s http://localhost:18090/health
ok
$ curl -s http://localhost:18090/
visits: 3
```

The health checks did not count as visits. Everything Compose created is ordinary Docker objects, visible with the commands from earlier lessons:

```console
$ docker ps --filter label=com.docker.compose.project=counter --format '{{.Names}}' | sort
counter-redis-1
counter-web-1
$ docker network ls --filter name=counter_ --format '{{.Name}}'
counter_default
$ docker volume ls --filter name=counter_ --format '{{.Name}}'
counter_redis-data
$ docker compose exec redis redis-cli GET visits
3
```

### 5. Down, Up, and What Survives

`docker compose down` stops and removes the containers and the network — but **not** named volumes:

```console
$ docker compose --progress quiet down
$ docker ps -a --filter label=com.docker.compose.project=counter --format '{{.Names}}'
$ docker volume ls --filter name=counter_ --format '{{.Name}}'
counter_redis-data
$ docker compose --progress quiet up -d --wait
$ curl -s http://localhost:18090/
visits: 4
```

New containers, same volume: the count carried on from 3. This is the normal way to deploy a new version — replace the containers, keep the data. `down -v` removes the volumes too, and with them the data:

```console
$ docker compose --progress quiet down -v
$ docker compose --progress quiet up -d --wait
$ curl -s http://localhost:18090/
visits: 1
```

Back to 1. `-v` is the one flag in this lesson that destroys data; it belongs in a clean-up script, never in a deploy script.

### 6. A Clean Stop

Because the web service handles `SIGTERM`, stopping the application is quick and clean:

```console
$ start=$(date +%s%N); docker compose --progress quiet stop; ms=$(( ($(date +%s%N) - start) / 1000000 )); [ $ms -lt 5000 ] && echo "stopped in under 5 s"
stopped in under 5 s
$ docker compose ps -a --format '{{.Service}}: exit {{.ExitCode}}' | sort
redis: exit 0
web: exit 0
$ docker compose --progress quiet down -v
```

Both exited with status 0: Redis handles `SIGTERM` itself, and the web service now does too. Without the one `signal.signal` line in `server.py`, `web` would sit out Compose's ten-second timeout and be killed with 137 on every stop.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Scale the Web Service

Compose can run several containers of one service. Run three `web` containers behind no load balancer at all, and show that they share one counter — because the state is in Redis, not in the web containers. (Remove the published port first, since three containers cannot all bind host port 18090.)

**Solution:** a second Compose file can override the first. Here it replaces `web`'s `ports` with none:

```yaml [counter/compose.scale.yaml]
services:
  web:
    ports: !reset []
```

```console
$ docker compose -f compose.yaml -f compose.scale.yaml --progress quiet up -d --wait --scale web=3
$ docker compose ps --format '{{.Name}}' | sort
counter-redis-1
counter-web-1
counter-web-2
counter-web-3
$ for n in 1 2 3; do docker compose exec --index $n web python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/').read().decode(), end='')"; done
visits: 1
visits: 2
visits: 3
$ docker compose -f compose.yaml -f compose.scale.yaml --progress quiet down -v
```

Three containers, one count: each request went to a different container, and the count still went 1, 2, 3. Keeping state out of the web containers is what makes them replaceable and scalable — the whole idea of lessons 5 and 7 in one line of output.

### Exercise 2: Read the Merged Configuration

`docker compose config` prints the configuration Compose actually uses, after merging files and filling in defaults. Use it to check which port `web` publishes with and without the override file.

**Solution:**

```console
$ docker compose config --format json | python3 -c 'import json,sys; ports = json.load(sys.stdin)["services"]["web"].get("ports") or []; print(", ".join(p["host_ip"] + ":" + str(p["published"]) + " -> " + str(p["target"]) for p in ports) or "no published ports")'
127.0.0.1:18090 -> 8000
$ docker compose -f compose.yaml -f compose.scale.yaml config --format json | python3 -c 'import json,sys; ports = json.load(sys.stdin)["services"]["web"].get("ports") or []; print(", ".join(p["host_ip"] + ":" + str(p["published"]) + " -> " + str(p["target"]) for p in ports) or "no published ports")'
no published ports
```

With the override, `web` has no ports at all. Reading `docker compose config` is the quickest way to answer "what will Compose actually do?" when several files and environment variables are involved.

## 🔑 Key Points to Remember

- Multi-stage builds: build with every tool you need, then `COPY --from` only the result into a small final stage.
- `compose.yaml` describes services, networks and volumes; Compose creates a network per project, so services reach each other by service name.
- Use health checks and `depends_on: condition: service_healthy` — a started container is not necessarily ready.
- `docker compose down` keeps named volumes; `down -v` deletes them.
- Handle `SIGTERM` in anything that runs as PID 1, and keep state in volumes or in services built to hold it, so that application containers stay replaceable.

## 📝 Homework

1. Add `restart: unless-stopped` to both services, then `docker kill` the web container. What does Compose do, and what does `docker compose ps` show?
2. Change the web service's `CMD` to the shell form (`CMD python server.py`) and repeat section 6. Explain the result using lesson 4.
3. Put the Redis port behind `127.0.0.1:16379` for debugging, and connect with `redis-cli -p 16379` from the host. Then remove it again: which services in your own projects publish ports they do not need to?
