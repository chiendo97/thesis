package storage

import (
	"context"
	"math/rand"
	"sync"
	"time"

	"github.com/chiendo97/abtest-server/db"
	"github.com/chiendo97/abtest-server/types"
)

type Store struct {
	db *db.Database
}

func NewStore(db *db.Database) (*Store, error) {
	return &Store{db: db}, nil
}

func (store *Store) GetSummary(ctx context.Context) ([]*types.SummaryProduct, error) {
	products, err := store.db.GetProducts(ctx)
	if err != nil {
		return nil, err
	}

	summaryProducts := make([]*types.SummaryProduct, len(products))

	var wg sync.WaitGroup
	errCh := make(chan error, 1)

	for productIndex, product := range products {
		wg.Add(1)

		go func(productIndex int, product *types.Product) {
			defer wg.Done()

			layers, err := store.db.GetLayers(ctx, product.Id)
			if err != nil {
				errCh <- err
				return
			}

			summaryProduct := &types.SummaryProduct{
				Product: product,
				Layers:  make([]types.SummaryLayer, len(layers)),
			}

			for layerIndex, layer := range layers {
				wg.Add(1)

				go func(layerIndex int, layer *types.Layer) {
					defer wg.Done()

					experiments, err := store.db.GetExperiments(ctx, layer.Id)
					if err != nil {
						errCh <- err
						return
					}

					summaryLayer := types.SummaryLayer{
						Layer:         layer,
						UnusedTraffic: 100,
						Experiments:   make([]types.SummaryExperiment, len(experiments)),
					}

					for expIndex, experiment := range experiments {
						wg.Add(1)

						go func(expIndex int, experiment *types.Experiment) {
							defer wg.Done()

							groups, err := store.db.GetGroups(ctx, experiment.Id)
							if err != nil {
								errCh <- err
								return
							}

							summaryExperiment := types.SummaryExperiment{
								Experiment: experiment,
								Groups:     make([]types.SummaryGroup, 0, len(groups)),
							}

							for _, group := range groups {
								if len(group.Parameters) == 0 {
									group.Parameters = make([]types.Parameter, 0)
								}
								summaryGroup := types.SummaryGroup{
									Group: group,
								}

								summaryExperiment.Groups = append(
									summaryExperiment.Groups,
									summaryGroup,
								)
							}
							summaryLayer.Experiments[expIndex] = summaryExperiment
						}(expIndex, experiment)
					}

					// unused traffic
					now := time.Now().Unix()

					for _, experiment := range experiments {
						if experiment.StartTime > now || now > experiment.EndTime {
							continue
						}

						summaryLayer.UnusedTraffic -= experiment.Traffic
					}

					if summaryLayer.UnusedTraffic < 0 {
						summaryLayer.UnusedTraffic = 0
					}

					summaryProduct.Layers[layerIndex] = summaryLayer
				}(layerIndex, layer)

			}
			summaryProducts[productIndex] = summaryProduct
		}(productIndex, product)
	}

	go func() {
		wg.Wait()
		errCh <- nil
	}()

	err = <-errCh
	if err != nil {
		return nil, err
	}

	return summaryProducts, nil
}

func (store *Store) GetParameters(ctx context.Context) ([]string, error) {
	return store.db.GetParameters(ctx)
}

func (store *Store) CreateProduct(ctx context.Context, product *types.Product) error {
	productId, err := store.db.GenProductId(ctx)
	if err != nil {
		return err
	}

	product.Id = productId

	err = store.db.SetProduct(ctx, product)
	if err != nil {
		return err
	}

	err = store.db.AddProduct(ctx, product.Id)
	if err != nil {
		return err
	}

	return nil
}

func (store *Store) CreateLayer(ctx context.Context, layer *types.Layer, id int64) error {
	genId, err := store.db.GenLayerId(ctx)
	if err != nil {
		return err
	}

	layer.Id = genId

	err = store.db.SetLayer(ctx, layer)
	if err != nil {
		return err
	}

	err = store.db.AddLayer(ctx, id, layer.Id)
	if err != nil {
		return err
	}

	return nil
}

func (store *Store) CreateExperiment(ctx context.Context, exp *types.Experiment, id int64) error {
	genId, err := store.db.GenExperimentId(ctx)
	if err != nil {
		return err
	}

	exp.Id = genId

	err = store.db.SetExperiment(ctx, exp)
	if err != nil {
		return err
	}

	err = store.db.AddExperiment(ctx, id, exp.Id)
	if err != nil {
		return err
	}

	return nil
}

func (store *Store) CreateGroup(ctx context.Context, group *types.Group, id int64) error {
	genId, err := store.db.GenGroupId(ctx)
	if err != nil {
		return err
	}

	group.Id = genId

	err = store.db.SetGroup(ctx, group)
	if err != nil {
		return err
	}

	err = store.db.AddGroup(ctx, id, group.Id)
	if err != nil {
		return err
	}

	return nil
}

func (store *Store) CreateParameter(ctx context.Context, name string) error {
	return store.db.AddParameter(ctx, name)
}

func (store *Store) UpdateProduct(ctx context.Context, product *types.Product) error {
	return store.db.SetProduct(ctx, product)
}

func (store *Store) UpdateLayer(ctx context.Context, layer *types.Layer) error {
	return store.db.SetLayer(ctx, layer)
}

func (store *Store) UpdateExperiment(ctx context.Context, exp *types.Experiment) error {
	return store.db.SetExperiment(ctx, exp)
}

func (store *Store) UpdateGroup(ctx context.Context, group *types.Group) error {
	return store.db.SetGroup(ctx, group)
}

func (store *Store) AbTest(ctx context.Context, req *types.ABTestRequest) ([]*types.ABTest, error) {
	product, err := store.db.GetProduct(ctx, req.ProductId)
	if err != nil {
		return nil, err
	}

	layers, err := store.db.GetLayers(ctx, product.Id)
	if err != nil {
		return nil, err
	}

	abTests := make([]*types.ABTest, 0, len(layers))

	now := time.Now().Unix()

	for _, layer := range layers {
		experiments, err := store.db.GetExperiments(ctx, layer.Id)
		if err != nil {
			return nil, err
		}

		n := 0
		for _, experiment := range experiments {
			if experiment.StartTime > now || now > experiment.EndTime {
				continue
			}
			if experiment.Status != types.ExperimentStart {
				continue
			}

			groups, err := store.db.GetGroups(ctx, experiment.Id)
			if err != nil {
				return nil, err
			}

			if len(groups) == 0 {
				continue
			}

			experiments[n] = experiment
			n++
		}
		experiments = experiments[:n]

		if len(experiments) == 0 {
			continue
		}

		hashTraffic := make([]int, 100)
		for i := range hashTraffic {
			hashTraffic[i] = -1
		}

		n = 0
		for i, experiment := range experiments {
			for j := 0; j < experiment.Traffic; j++ {
				if n >= len(hashTraffic) {
					break
				}
				hashTraffic[n] = i
				n++
			}
		}

		randomTraffic := 0
		switch layer.Type {
		case types.LayerTypeUserId:
			randomTraffic = int(req.UserId % 100)
		case types.LayerTypeSessionId:
			randomTraffic = int(req.SessionId % 100)
		}

		randomExperiment := hashTraffic[randomTraffic]

		if randomExperiment == -1 {
			continue
		}

		experiment := experiments[randomExperiment]

		groups, err := store.db.GetGroups(ctx, experiment.Id)
		if err != nil {
			return nil, err
		}

		randonGroup := rand.Intn(len(groups))
		switch layer.Type {
		case types.LayerTypeUserId:
			randonGroup = int(req.UserId) % len(groups)
		case types.LayerTypeSessionId:
			randonGroup = int(req.SessionId) % len(groups)
		}

		abTest := &types.ABTest{
			ProductId:    product.Id,
			LayerId:      layer.Id,
			ExperimentId: experiment.Id,
			GroupId:      groups[randonGroup].Id,
			Parameters:   groups[randonGroup].Parameters,
		}

		abTests = append(abTests, abTest)
	}

	return abTests, nil
}
