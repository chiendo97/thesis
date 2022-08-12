package types

type APIPamameter struct {
	Name string `json:"name"`
}

type APIProduct struct {
	*Product
}

type APILayer struct {
	*Layer

	ProductId int64 `json:"product_id"`
}

type APIExperiment struct {
	*Experiment

	LayerId int64 `json:"layer_id"`
}

type APIGroup struct {
	*Group

	ExpId int64 `json:"exp_id"`
}

type SummaryProduct struct {
	*Product

	Layers []SummaryLayer `json:"layers"`
}

type SummaryLayer struct {
	*Layer

	UnusedTraffic int `json:"unused_traffic"`

	Experiments []SummaryExperiment `json:"experiments"`
}

type SummaryExperiment struct {
	*Experiment

	Groups []SummaryGroup `json:"groups"`
}

type SummaryGroup struct {
	*Group
}

type ABTestRequest struct {
	ProductId int64 `json:"product_id"`
	UserId    int64 `json:"user_id"`
	SessionId int64 `json:"session_id"`
}

type ABTestResponse struct {
	ABTests []ABTest `json:"ab_tests"`
}

type ABTest struct {
	ProductId    int64 `json:"product_id"`
	LayerId      int64 `json:"layer_id"`
	ExperimentId int64 `json:"experiment_id"`
	GroupId      int64 `json:"group_id"`

	Parameters []Parameter `json:"parameters"`
}
