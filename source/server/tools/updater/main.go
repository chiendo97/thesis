package main

import (
	"context"
	"encoding/json"
	"flag"
	"os"

	"gopkg.in/yaml.v3"

	"github.com/chiendo97/abtest-server/config"
	"github.com/chiendo97/abtest-server/db"
	"github.com/chiendo97/abtest-server/storage"
	"github.com/chiendo97/abtest-server/types"
)

var (
	data = flag.String("file", "", "")
	path = flag.String("config", "", "")
)

func init() {
	flag.Parse()
}

func main() {
	data, err := os.ReadFile(*data)
	if err != nil {
		panic(err)
	}

	summaryProducts := make([]types.SummaryProduct, 0)

	err = json.Unmarshal(data, &summaryProducts)
	if err != nil {
		panic(err)
	}

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

	for _, summaryProduct := range summaryProducts {
		err = store.CreateProduct(context.Background(), summaryProduct.Product)
		if err != nil {
			panic(err)
		}

		for _, summaryLayer := range summaryProduct.Layers {
			err = store.CreateLayer(context.Background(), summaryLayer.Layer, summaryProduct.Id)
			if err != nil {
				panic(err)
			}

			for _, summaryExperiment := range summaryLayer.Experiments {
				err = store.CreateExperiment(
					context.Background(),
					summaryExperiment.Experiment,
					summaryLayer.Id,
				)
				if err != nil {
					panic(err)
				}

				for _, summaryGroup := range summaryExperiment.Groups {
					err = store.CreateGroup(
						context.Background(),
						summaryGroup.Group,
						summaryExperiment.Id,
					)
					if err != nil {
						panic(err)
					}

					for _, parameter := range summaryGroup.Parameters {
						err = store.CreateParameter(context.Background(), parameter.Name)
						if err != nil {
							panic(err)
						}
					}
				}
			}
		}
	}
}
