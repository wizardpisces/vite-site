## How to run

```
ts-node server.js
ts-node server2.js
node multiple1.js
node multiple2.js
```

### Possible result

multiple1.js
```
BODY: [tiny-server]: [tiny-server2] : Response string 1: 3
BODY: [tiny-server]: [tiny-server2] : Response string 2: 4
BODY: [tiny-server]: [tiny-server2] : Response string 3: 5
BODY: [tiny-server]: [tiny-server2] : Response string 4: 6
BODY: [tiny-server]: [tiny-server2] : Response string 5: 7
BODY: [tiny-server]: [tiny-server2] : Response string 6: 8
BODY: [tiny-server]: [tiny-server2] : Response string 7: 9
BODY: [tiny-server]: [tiny-server2] : Response string 8: 8
BODY: [tiny-server]: [tiny-server2] : Response string 9: 9
```
multiple2.js
```
BODY: [tiny-server]: [tiny-server2] : Response string 1: 1
BODY: [tiny-server]: [tiny-server2] : Response string 2: 1
BODY: [tiny-server]: [tiny-server2] : Response string 3: 2
BODY: [tiny-server]: [tiny-server2] : Response string 4: 3
BODY: [tiny-server]: [tiny-server2] : Response string 5: 4
BODY: [tiny-server]: [tiny-server2] : Response string 6: 5
BODY: [tiny-server]: [tiny-server2] : Response string 7: 6
BODY: [tiny-server]: [tiny-server2] : Response string 8: 7
BODY: [tiny-server]: [tiny-server2] : Response string 9: 8
```

### 结论

node
同步阻塞(cpu-bound运算)
异步非阻塞(网络请求/数据库操作等)

表现形式： 请求之间会对全局的变量互篡改

对于并发的处理大致如下:

```
req1 |-  cpu -|--- request ---|- cpu -|
req2          |- cpu -|--- request ---|- cpu -|
req3                  |- cpu -|---request---| |- cpu -|
```