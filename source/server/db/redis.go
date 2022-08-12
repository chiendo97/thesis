package db

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/go-redis/redis/v8"

	"github.com/chiendo97/abtest-server/types"
)

type Config struct {
	Addr string `yaml:"addr"`
}

type Database struct {
	rdb redis.Client
}

func NewDatabase(cfg Config) (*Database, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr: cfg.Addr,
	})

	err := rdb.Ping(context.Background()).Err()
	if err != nil {
		return nil, err
	}

	return &Database{rdb: *rdb}, nil
}

func (db *Database) SetProduct(ctx context.Context, product *types.Product) error {
	js, err := json.Marshal(&product)
	if err != nil {
		return err
	}

	return db.rdb.Set(ctx, fmt.Sprintf("product::%d", product.Id), js, 0).Err()
}

func (db *Database) SetLayer(ctx context.Context, layer *types.Layer) error {
	js, err := json.Marshal(&layer)
	if err != nil {
		return err
	}

	return db.rdb.Set(ctx, fmt.Sprintf("layer::%d", layer.Id), js, 0).Err()
}

func (db *Database) SetExperiment(ctx context.Context, exp *types.Experiment) error {
	js, err := json.Marshal(&exp)
	if err != nil {
		return err
	}

	return db.rdb.Set(ctx, fmt.Sprintf("exp::%d", exp.Id), js, 0).Err()
}

func (db *Database) SetGroup(ctx context.Context, group *types.Group) error {
	js, err := json.Marshal(&group)
	if err != nil {
		return err
	}

	return db.rdb.Set(ctx, fmt.Sprintf("group::%d", group.Id), js, 0).Err()
}

func (db *Database) AddProduct(ctx context.Context, id int64) error {
	return db.rdb.SAdd(ctx, "product::ids", id).Err()
}

func (db *Database) AddLayer(ctx context.Context, id, child int64) error {
	return db.rdb.SAdd(ctx, fmt.Sprintf("product::%d::layers", id), child).Err()
}

func (db *Database) AddExperiment(ctx context.Context, id, child int64) error {
	return db.rdb.SAdd(ctx, fmt.Sprintf("layer::%d::exps", id), child).Err()
}

func (db *Database) AddGroup(ctx context.Context, id, child int64) error {
	return db.rdb.SAdd(ctx, fmt.Sprintf("exp::%d::groups", id), child).Err()
}

func (db *Database) AddParameter(ctx context.Context, name string) error {
	return db.rdb.SAdd(ctx, "parameters", name).Err()
}

func (db *Database) GetProduct(ctx context.Context, id int64) (*types.Product, error) {
	js, err := db.rdb.Get(ctx, fmt.Sprintf("product::%d", id)).Bytes()
	if err != nil {
		return nil, err
	}

	product := &types.Product{}
	err = json.Unmarshal(js, &product)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (db *Database) GetLayer(ctx context.Context, id int64) (*types.Layer, error) {
	js, err := db.rdb.Get(ctx, fmt.Sprintf("layer::%d", id)).Bytes()
	if err != nil {
		return nil, err
	}

	product := &types.Layer{}
	err = json.Unmarshal(js, &product)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (db *Database) GetExperiment(ctx context.Context, id int64) (*types.Experiment, error) {
	js, err := db.rdb.Get(ctx, fmt.Sprintf("exp::%d", id)).Bytes()
	if err != nil {
		return nil, err
	}

	product := &types.Experiment{}
	err = json.Unmarshal(js, &product)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (db *Database) GetGroup(ctx context.Context, id int64) (*types.Group, error) {
	js, err := db.rdb.Get(ctx, fmt.Sprintf("group::%d", id)).Bytes()
	if err != nil {
		return nil, err
	}

	product := &types.Group{}
	err = json.Unmarshal(js, &product)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (db *Database) GetProducts(ctx context.Context) ([]*types.Product, error) {
	ids, err := db.rdb.SMembers(ctx, "product::ids").Result()
	if err != nil {
		return nil, err
	}

	products := make([]*types.Product, 0, len(ids))
	for _, id := range ids {
		js, err := db.rdb.Get(ctx, fmt.Sprintf("product::%s", id)).Bytes()
		if err != nil {
			return nil, err
		}

		product := &types.Product{}
		err = json.Unmarshal(js, &product)
		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	return products, nil
}

func (db *Database) GetLayers(ctx context.Context, id int64) ([]*types.Layer, error) {
	ids, err := db.rdb.SMembers(ctx, fmt.Sprintf("product::%d::layers", id)).Result()
	if err != nil {
		return nil, err
	}

	products := make([]*types.Layer, 0, len(ids))
	for _, id := range ids {
		js, err := db.rdb.Get(ctx, fmt.Sprintf("layer::%s", id)).Bytes()
		if err != nil {
			return nil, err
		}

		product := &types.Layer{}
		err = json.Unmarshal(js, &product)
		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	return products, nil
}

func (db *Database) GetExperiments(ctx context.Context, id int64) ([]*types.Experiment, error) {
	ids, err := db.rdb.SMembers(ctx, fmt.Sprintf("layer::%d::exps", id)).Result()
	if err != nil {
		return nil, err
	}

	products := make([]*types.Experiment, 0, len(ids))
	for _, id := range ids {
		js, err := db.rdb.Get(ctx, fmt.Sprintf("exp::%s", id)).Bytes()
		if err != nil {
			return nil, err
		}

		product := &types.Experiment{}
		err = json.Unmarshal(js, &product)
		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	return products, nil
}

func (db *Database) GetGroups(ctx context.Context, id int64) ([]*types.Group, error) {
	ids, err := db.rdb.SMembers(ctx, fmt.Sprintf("exp::%d::groups", id)).Result()
	if err != nil {
		return nil, err
	}

	products := make([]*types.Group, 0, len(ids))
	for _, id := range ids {
		js, err := db.rdb.Get(ctx, fmt.Sprintf("group::%s", id)).Bytes()
		if err != nil {
			return nil, err
		}

		product := &types.Group{}
		err = json.Unmarshal(js, &product)
		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	return products, nil
}

func (db *Database) GetParameters(ctx context.Context) ([]string, error) {
	parameterNames, err := db.rdb.SMembers(ctx, "parameters").Result()
	if err != nil {
		return nil, err
	}

	return parameterNames, nil
}

func (db *Database) GenProductId(ctx context.Context) (int64, error) {
	return db.rdb.Incr(ctx, "product::id").Result()
}

func (db *Database) GenLayerId(ctx context.Context) (int64, error) {
	return db.rdb.Incr(ctx, "layer::id").Result()
}

func (db *Database) GenExperimentId(ctx context.Context) (int64, error) {
	return db.rdb.Incr(ctx, "exp::id").Result()
}

func (db *Database) GenGroupId(ctx context.Context) (int64, error) {
	return db.rdb.Incr(ctx, "group::id").Result()
}
