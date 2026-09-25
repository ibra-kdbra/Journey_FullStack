# Lesson 6: Networking

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Explain why a server in a container is unreachable until you publish its port
- Publish ports, and bind them to one host interface
- Connect containers on a user-defined network and reach each other by name
- Explain why the default network gives containers no names, and why that matters
- Isolate groups of containers from each other with separate networks

## 📝 Detailed Content

### 1. A Container Has Its Own Network

A container gets its own network namespace: its own interfaces, its own `localhost`, its own ports. A server listening on port 8000 inside a container is listening on the *container's* port 8000, which nothing outside can reach by default.

This lesson's server is Python's built-in HTTP server, from the official Python image:

```console
$ docker pull -q python:3.12.7-alpine3.20
docker.io/library/python:3.12.7-alpine3.20
```

```text [site/index.html]
hello from inside a container
```

```console
$ docker run -d --name web -v "$PWD/site:/srv:ro" -w /srv python:3.12.7-alpine3.20 python -m http.server 8000 >/dev/null
$ until docker exec web wget -qO- http://localhost:8000/ >/dev/null 2>&1; do sleep 0.2; done
$ docker exec web wget -qO- http://localhost:8000/index.html
hello from inside a container
$ curl -s --max-time 2 http://localhost:8000/index.html || echo "curl: nothing is listening on the host's port 8000"
curl: nothing is listening on the host's port 8000
```

(`-w` sets the working directory, which `http.server` serves.) A container that has *started* has not necessarily finished starting its server, so the `until` loop polls until the server answers — a detail that matters whenever a script starts a container and uses it straight away. From inside its own namespace, the server answers on `localhost:8000`. From the host, there is nothing there: the host's `localhost` is a different network stack.

### 2. Publishing Ports

`-p HOST:CONTAINER` publishes a container port: Docker forwards connections to the host port into the container:

```console
$ docker rm -f web >/dev/null
$ docker run -d --name web -p 127.0.0.1:18080:8000 -v "$PWD/site:/srv:ro" -w /srv python:3.12.7-alpine3.20 python -m http.server 8000 >/dev/null
$ until curl -s http://localhost:18080/ >/dev/null; do sleep 0.2; done
$ curl -s http://localhost:18080/index.html
hello from inside a container
$ docker port web
8000/tcp -> 127.0.0.1:18080
```

The host port (18080) and the container port (8000) need not match, which is how you run several containers that all listen on 8000 inside.

Note the `127.0.0.1:` prefix. Plain `-p 18080:8000` publishes on **every** interface of the host — `0.0.0.0` — so anyone who can reach the machine can reach the container. On Linux, Docker inserts its own firewall rules for published ports, which bypass host firewall front ends such as `ufw`: a port you thought was firewalled may be open. Publish on `127.0.0.1` anything that only the host itself (or a reverse proxy on it) should reach.

### 3. Containers Talking to Containers

An application is usually several containers — a web server, an API, a database. They need to find each other. On a **user-defined network**, Docker runs a DNS server that resolves each container's name to its address:

```console
$ docker network create shop
[...]
$ docker run -d --name api --network shop -v "$PWD/site:/srv:ro" -w /srv python:3.12.7-alpine3.20 python -m http.server 8000 >/dev/null
$ until docker exec api wget -qO- http://localhost:8000/ >/dev/null 2>&1; do sleep 0.2; done
$ docker run --rm --network shop alpine:3.20.3 wget -qO- http://api:8000/index.html
hello from inside a container
```

The client addressed the server as `api`, its container name. No ports were published: containers on the same network reach each other's ports directly, and only what must be reachable from outside needs `-p`.

Addresses are assigned dynamically, and a replaced container usually gets a new one; names stay the same. Always connect by name.

### 4. The Default Network Has No Names

Containers started without `--network` join the **default bridge** network. They can reach each other by IP address, but Docker's DNS does not serve names there:

```console
$ docker run -d --name lonely -v "$PWD/site:/srv:ro" -w /srv python:3.12.7-alpine3.20 python -m http.server 8000 >/dev/null
$ until docker exec lonely wget -qO- http://localhost:8000/ >/dev/null 2>&1; do sleep 0.2; done
$ docker run --rm alpine:3.20.3 wget -qO- -T 2 http://lonely:8000/index.html
wget: bad address 'lonely:8000'
```

This is a historical leftover — the default bridge predates Docker's built-in DNS — and it is the reason for the first rule of container networking: **create a network for your application.** Docker Compose (lesson 7) does it for you.

### 5. Networks Isolate

Containers on different user-defined networks cannot reach each other at all:

```console
$ docker network create admin
[...]
$ docker run --rm --network admin alpine:3.20.3 wget -qO- -T 2 http://api:8000/index.html
wget: bad address 'api:8000'
```

`api` is on `shop`, so from `admin` its name does not resolve. A container can join several networks — `docker network connect admin api` — which is how you give, say, a reverse proxy access to two groups that must not reach each other directly.

`--network none` goes further, leaving a container with only a loopback interface, for work that should have no network at all:

```console
$ docker run --rm --network none alpine:3.20.3 wget -qO- -T 2 http://example.com/
wget: bad address 'example.com'
```

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Two Services, One Published Port

Run an "API" and a "frontend" on a network called `app`. Only the frontend should be reachable from the host, on port 18081; the API only from the frontend. The frontend here is a second `http.server` — show that it can fetch from the API by name, and that the API is not reachable from the host.

**Solution:**

```text [api-data/status.json]
{"status": "ok"}
```

```console
$ docker network create app
[...]
$ docker run -d --name app-api --network app -v "$PWD/api-data:/srv:ro" -w /srv python:3.12.7-alpine3.20 python -m http.server 8000 >/dev/null
$ docker run -d --name app-frontend --network app -p 127.0.0.1:18081:8000 -v "$PWD/site:/srv:ro" -w /srv python:3.12.7-alpine3.20 python -m http.server 8000 >/dev/null
$ until curl -s http://localhost:18081/ >/dev/null && docker exec app-api wget -qO- http://localhost:8000/ >/dev/null 2>&1; do sleep 0.2; done
$ curl -s http://localhost:18081/index.html
hello from inside a container
$ docker exec app-frontend wget -qO- http://app-api:8000/status.json
{"status": "ok"}
$ docker port app-api
```

`docker port` on the API prints nothing at all: it has no published ports, so the only way in is from the `app` network.

### Exercise 2: What Does a Container See as Its Name?

Inside a container on a user-defined network, look up your own name and another container's name with `nslookup`. Where does the answer come from?

**Solution:**

```console
$ docker run --rm --network app --name curious alpine:3.20.3 sh -c 'grep nameserver /etc/resolv.conf; nslookup app-api >/dev/null && echo "app-api resolves"; nslookup curious >/dev/null && echo "curious resolves"'
nameserver 127.0.0.11
app-api resolves
curious resolves
```

The nameserver is `127.0.0.11`, Docker's embedded DNS server, which answers for every container on the networks this container belongs to — including itself — and forwards other names to the host's resolvers.

## 🔑 Key Points to Remember

- Each container has its own network stack; its `localhost` is not the host's.
- `-p HOST:CONTAINER` publishes a port on all host interfaces; `-p 127.0.0.1:HOST:CONTAINER` only on loopback. Docker's rules bypass host firewall front ends.
- On user-defined networks, containers reach each other by name through Docker's DNS (`127.0.0.11`). The default bridge has no names.
- Publish only what must be reachable from outside; internal services talk over the network.
- Separate networks isolate groups of containers; `--network none` removes networking entirely.

## 📝 Homework

1. Run `docker network inspect shop --format '{{json .IPAM.Config}}'` and find the subnet Docker chose. What happens to a container's address when it is recreated?
2. Give a container a second name on a network with `--network-alias`, and check that both names resolve. What is this useful for?
3. Read about `--network host`. What does it remove, and what does it cost?
