# [Map](http://craftinginterpreters.com/image/a-map-of-the-territory/mountain.png)

### Introduction of map

* sourceCode (scanning)-> tokens (parsing)-> syntaxTree(**step3**) (analysis/transform)-> intermediateRepresentation or IR(**step4**) (codeGen)-> machineCode
* **step4** -> (Optimizing **step4**) 
* **step4** (codeGen + sourceMap)-> byteCode(virtualMachine run! )
* **step3** -> highLevelLanguage(transpiling) -> **step4**   (short cuts)

### A Map of Territory

* [The-parts-of-a-language](#The-parts-of-a-language)
* [Compilers and Interpreters](#Compilers-and-Interpreters)
* [Short-cuts-and-alternate-routes](#Short-cuts-and-alternate-routes)


# The-parts-of-a-language

## Scanning
also known as lexing
A scanner (or lexer) takes in the linear stream of characters and chunks them together into a series of something more akin to “words”. 

## Parsing
This is where syntax gets a grammar—the ability to compose larger expressions and statements out of smaller parts. Did you ever diagram sentences in English class?

## Static analysis
The first bit of analysis that most languages do is called binding or resolution. For each identifier we find out where that name is defined and wire the two together. This is where scope comes into play—the region of source code where a certain name can be used to refer to a certain declaration.

**Everything up to this point is considered the front end of the implementation.**

## Intermediate Representation

The front end of the pipeline is specific to the source language the program is written in. 
The back end is concerned with the final architecture where the program will run.
In the middle, the code may be stored in some intermediate representation (or IR) that isn’t tightly tied to either the source or destination forms (hence “intermediate”). 
Instead, the IR acts as an interface between these two languages.

## Optimization

eg:
### Constant folding
pennyArea = 3.14159 * (0.75 / 2) * (0.75 / 2);
->
pennyArea = 0.4417860938;

## Code Generation

where “code” here usually refers to the kind of primitive assembly-like instructions a CPU runs and not the kind of “source code” a human might want to read.

## Virtual Machine

virtual machine (VM), a program that emulates a hypothetical chip supporting your virtual architecture at runtime. Running B in a VM is slower than translating it to native code ahead of time because every instruction must be simulated at runtime each time it executes.
In return, you get simplicity and portability.

## Runtime

In, say, Go, each compiled application has its own copy of Go’s runtime directly embedded in it. If the language is run inside an interpreter or VM, then the runtime lives there. This is how most implementations of languages like Java, Python, and JavaScript work.

# Short-cuts-and-alternate-routes

## Single pass compiler

Some simple compilers interleave parsing, analysis, and code generation so that they produce output code directly in the parser, without ever allocating any syntax trees or other IRs.

Pascal and C were designed around this limitation.
At the time, memory was so precious that a compiler might not even be able to hold an entire source file in memory, much less the whole program. 

## Tree-walk interpreters

## Transpilers

**source-to-source compiler or transcompiler**

treated some other source language as if it were an intermediate representation
run that resulting code through the output language’s existing compilation pipeline and you’re good to go.
eg: coffee -> javascript, sass -> css

C compilers were available everywhere UNIX was and produced efficient code, so targeting C was a good way to get your language running on a lot of architectures.

Web browsers are the “machines” of today, and their “machine code” is JavaScript, so these days it seems almost every language out there has a compiler that targets JS since that’s the main way to get your code running in a browser.

## Just-in-time compilation

 The fastest way to execute code is by compiling it to machine code, but you might not know what architecture your end user’s machine supports. What to do?

 You can do the same thing that the HotSpot JVM, Microsoft’s CLR and most JavaScript interpreters do. On the end user’s machine, when the program is loaded—either from source in the case of JS, or platform-independent bytecode for the JVM and CLR—you compile it to native for the architecture their computer supports.Naturally enough, this is called just-in-time compilation.

 The most sophisticated JITs insert profiling hooks into the generated code to see which regions are most performance critical and what kind of data is flowing through them. Then, over time, they will automatically recompile those hot spots with more advanced optimizations.

# Compilers-and-Interpreters

What’s the difference between a fruit and a vegetable？

but actually “fruit” is a botanical（植物学） term and “vegetable” is culinary（烹饪）.There are fruits that aren’t vegetables (apples) and vegetables that are not fruits (carrots), but also edible plants that are both fruits and vegetables, like tomatoes.

What’s the difference between a compiler and an interpreter?

* Compiling is an implementation technique that involves translating a source language to some other—usually lower-level—form. When you generate bytecode or machine code, you are compiling. When you transpile to another high-level language you are compiling too.

* When we say a language implementation “is a compiler”, we mean it translates source code to some other form but doesn’t execute it. The user has to take the resulting output and run it themselves.

* Conversely, when we say an implementation “is an interpreter”, we mean it takes in source code and executes it immediately. It runs programs “from source”.

GCC and Clang take your C code and compile it to machine code. An end user runs that executable directly and may never even know which tool was used to compile it. So those are compilers for C.

eg:

If you run go build, it compiles your Go source code to machine code and stops. If you type go run, it does that then immediately executes the generated executable.

So go is a compiler (you can use it as a tool to compile code without running it), is an interpreter (you can invoke it to immediately run a program from source), and also has a compiler (when you use it as an interpreter, it is still compiling internally).

# Reference

* http://craftinginterpreters.com/a-map-of-the-territory.html#transpilers
* https://justinmeiners.github.io/lc3-vm/

