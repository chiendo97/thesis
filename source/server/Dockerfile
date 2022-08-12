FROM golang:1.18-alpine AS build

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . ./

EXPOSE 8080

# Build the Go app
RUN go build -o ./bin/abtest-server cmd/*.go
RUN go build -o bin/abtest-updater tools/updater/*.go
# RUN ./bin/abtest-updater  -file tools/updater/summary.json -config config/files/docker.yml

# This container exposes port 8080 to the outside world
EXPOSE 8080

# Run the binary program produced by `go install`
CMD ["sh", "./deploy.sh"]
