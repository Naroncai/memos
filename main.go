package main

import (
	_ "github.com/mattn/go-sqlite3"

	"github.com/usememos/memos/cmd"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		panic(err)
	}
}

// chat告诉我写的，引用了handler.go中的处理函数。这样，Vercel会将所有以/api/开头的请求路由到handler.go中定义的HTTP处理函数。2023.03.20
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
