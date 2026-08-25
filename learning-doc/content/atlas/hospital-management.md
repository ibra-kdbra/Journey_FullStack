---
title: Hospital Management
description: One clinical domain split across services, each with a hexagonal core and an infrastructure shell.
project: hospital-management
track: microservices
stack: [Java, Spring Boot, Spring Cloud Gateway, Eureka]
status: in-progress
compare: [nestjs-s.o.l.i.d, API_s.o.l.i.d_TS]
---

The only project here that answers the decomposition question: not "how do I
layer a service?" but "where does one domain stop being one deployable?"

## What problem shape is this for?

A domain with genuinely different rates of change and ownership — patient records,
scheduling, clinical notes, and billing evolve on separate clocks and have
separate compliance surfaces. That is the case for splitting; anything less
usually is not.

## The layer map

Each service repeats the same hexagonal shape. `patient-service` is the most
complete:

```
patient-service/src/main/java/com/hospital/patient/
  core/
    domain/entity/                the model, no Spring annotations
    domain/repository/            the port the core declares
    usecase/                      application logic
  infrastructure/
    web/controller/               the adapter
    web/dto/                      transport shapes, kept out of core
    web/mapper/                   dto ↔ entity translation
```

Around the services:

```
discovery-server/     Eureka — services register, nobody hardcodes a host
api-gateway/          Spring Cloud Gateway — one ingress, routing by service id
patient-service/      ✔ has a POM
billing-service/      sources only
clinical-service/     sources only
scheduling-service/   sources only
```

## The idea it demonstrates most clearly

**`web/mapper/` — that DTOs must not reach the core.** The mapper exists so a
change to an API response shape cannot ripple into a domain entity. Skip that
step and your domain model slowly becomes whatever your JSON looks like; it is
the most commonly omitted layer in service code and the most expensive to
retrofit.

The discovery server earns its place for a related reason: once services resolve
each other by *identity* rather than address, deployment topology stops being
encoded in application config.

## What it deliberately does not do

- No distributed tracing, no circuit breakers yet. Both matter in production and
  neither is needed to show the decomposition.
- No shared library between services. Duplication across service boundaries is
  the intended trade.

## Current status

`billing-service`, `clinical-service`, and `scheduling-service` contain sources
but no `pom.xml`, so they cannot build and Dependabot cannot track them. The
project is marked `in-progress` for that reason and is excluded from CI until
those POMs land.

## Running it

```bash
cd hospital-management/discovery-server && ./mvnw spring-boot:run   # start first
cd ../api-gateway        && ./mvnw spring-boot:run
cd ../patient-service    && ./mvnw spring-boot:run
./stress-test.sh
```

## Read alongside

- [`API_s.o.l.i.d_TS`](/atlas/api-solid-ts) — the same modular split, one deployable.
- [`nestjs-s.o.l.i.d`](/atlas/nestjs-solid) — module boundaries without process boundaries.
