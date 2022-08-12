package config

import "github.com/chiendo97/abtest-server/db"

type Config struct {
	DbCfg db.Config `yaml:"db_cfg"`
}
