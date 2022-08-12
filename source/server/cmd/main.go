package main

import (
	"flag"
	"os"

	"gopkg.in/yaml.v3"

	"github.com/chiendo97/abtest-server/config"
	"github.com/chiendo97/abtest-server/db"
	"github.com/chiendo97/abtest-server/service"
	"github.com/chiendo97/abtest-server/storage"
)

var path = flag.String("config", "", "")

func init() {
	flag.Parse()
}

func main() {
	file, err := os.ReadFile(*path)
	if err != nil {
		panic(err)
	}

	cfg := &config.Config{}

	if err = yaml.Unmarshal(file, &cfg); err != nil {
		panic(err)
	}

	db, err := db.NewDatabase(cfg.DbCfg)
	if err != nil {
		panic(err)
	}

	store, err := storage.NewStore(db)
	if err != nil {
		panic(err)
	}

	handler, err := service.NewHandler(store)
	if err != nil {
		panic(err)
	}

	if err := handler.Start(); err != nil {
		panic(err)
	}
}
