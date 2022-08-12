package service

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/chiendo97/abtest-server/storage"
	"github.com/chiendo97/abtest-server/types"
)

type Handler struct {
	engine *gin.Engine
	store  *storage.Store
}

func requestLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var buf bytes.Buffer
		tee := io.TeeReader(c.Request.Body, &buf)
		body, _ := ioutil.ReadAll(tee)
		c.Request.Body = ioutil.NopCloser(&buf)
		fmt.Println(string(body))
		c.Next()
	}
}

func NewHandler(store *storage.Store) (*Handler, error) {
	engine := gin.Default()
	engine.Use(requestLoggerMiddleware())

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	engine.Use(cors.New(config))

	handler := &Handler{engine: engine, store: store}
	handler.route()

	return handler, nil
}

func (handler *Handler) Start() error {
	return handler.engine.Run(":8080")
}

func (handler *Handler) route() {
	router := handler.engine.Group("/api/v1")
	router.GET("/summary", handler.Summary)
	router.POST("/abtest", handler.ABTest)

	product := router.Group("/product")
	product.POST("/create", handler.CreateProduct)
	product.POST("/update", handler.UpdateProduct)

	layer := router.Group("/layer")
	layer.POST("/create", handler.CreateLayer)
	layer.POST("/update", handler.UpdateLayer)

	experiment := router.Group("/experiment")
	experiment.POST("/create", handler.CreateExperiment)
	experiment.POST("/update", handler.UpdateExperiment)

	group := router.Group("/group")
	group.POST("/create", handler.CreateGroup)
	group.POST("/update", handler.UpdateGroup)

	parameter := router.Group("/parameter")
	parameter.POST("/create", handler.CreateParameter)
	parameter.GET("", handler.GetParameters)
}

func (handler *Handler) Summary(c *gin.Context) {
	summaryProducts, err := handler.store.GetSummary(c.Request.Context())
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, summaryProducts)
}

func (handler *Handler) ABTest(c *gin.Context) {
	req := &types.ABTestRequest{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	abTest, err := handler.store.AbTest(c.Request.Context(), req)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, abTest)
}

func (handler *Handler) GetParameters(c *gin.Context) {
	names, err := handler.store.GetParameters(c.Request.Context())
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, names)
}

func (handler *Handler) CreateParameter(c *gin.Context) {
	req := &types.APIPamameter{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.CreateParameter(c.Request.Context(), req.Name)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func (handler *Handler) CreateProduct(c *gin.Context) {
	req := &types.APIProduct{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.CreateProduct(c.Request.Context(), req.Product)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, req.Product)
}

func (handler *Handler) UpdateProduct(c *gin.Context) {
	req := &types.APIProduct{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.UpdateProduct(c.Request.Context(), req.Product)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func (handler *Handler) CreateLayer(c *gin.Context) {
	req := &types.APILayer{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.CreateLayer(c.Request.Context(), req.Layer, req.ProductId)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func (handler *Handler) UpdateLayer(c *gin.Context) {
	req := &types.APILayer{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.UpdateLayer(c.Request.Context(), req.Layer)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func (handler *Handler) CreateExperiment(c *gin.Context) {
	req := &types.APIExperiment{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.CreateExperiment(c.Request.Context(), req.Experiment, req.LayerId)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func (handler *Handler) UpdateExperiment(c *gin.Context) {
	req := &types.APIExperiment{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.UpdateExperiment(c.Request.Context(), req.Experiment)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func (handler *Handler) CreateGroup(c *gin.Context) {
	req := &types.APIGroup{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.CreateGroup(c.Request.Context(), req.Group, req.ExpId)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}

func (handler *Handler) UpdateGroup(c *gin.Context) {
	req := &types.APIGroup{}
	err := c.BindJSON(&req)
	if err != nil {
		return
	}

	err = handler.store.UpdateGroup(c.Request.Context(), req.Group)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, nil)
}
