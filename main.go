package main

import (
	_ "github.com/mattn/go-sqlite3"
	"github.com/usememos/memos/cmd"
	"net/http"
	"github.com/usememos/memos/api/handler" // 导入handler.go所在的包
)

func main() {
	http.HandleFunc("/api/activity", handler.Handler) // 注册处理函数
	err := cmd.Execute()
	if err != nil {
		panic(err)
	}
}
