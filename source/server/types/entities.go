package types

type Product struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

type Layer struct {
	Id   int64     `json:"id"`
	Name string    `json:"name"`
	Type LayerType `json:"type"`
}

type Experiment struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`

	Status ExperimentStatus `json:"status"`

	Traffic int `json:"traffic"`
}

type Group struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`

	Parameters []Parameter `json:"parameters"`
}

type Parameter struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type ExperimentStatus int64

const (
	ExperimentStart ExperimentStatus = iota + 1
	ExperimentStop
)

type LayerType int64

const (
	LayerTypeUserId LayerType = iota + 1
	LayerTypeSessionId
)
