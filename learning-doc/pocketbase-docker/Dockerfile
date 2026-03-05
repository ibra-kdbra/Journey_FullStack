# Use official alpine image for a small footprint
FROM alpine:latest

# Build argument for version
ARG PB_VERSION=0.26.5

# Install dependencies
RUN apk add --no-cache \
    unzip \
    ca-certificates \
    curl

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Expose the default port
EXPOSE 8080

# Start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
