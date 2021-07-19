---
title: virtual-machine 简介
description: 
---
### Virtual machine

* [ByteCode](#Bytecode)

# Bytecode

 A tree-walk interpreter is simple, portable, and slow. 
 On the other, native code(machine code) is complex and platform-specific but fast. 
 Bytecode sits in the middle. which needs to be run on [virtual machine](http://craftinginterpreters.com/image/chunks-of-bytecode/phases.png)

[Porting without a VM](https://justinmeiners.github.io/lc3-vm/img/no_vm.gif)
[Porting with a VM](https://justinmeiners.github.io/lc3-vm/img/vm.gif)

 Structurally, bytecode resembles machine code. It’s a dense, linear sequence of binary instructions. That keeps overhead low and plays nice with the cache. However, it’s a much simpler, higher-level instruction set than any real chip out there. (In many bytecode formats, each instruction is only a single byte long, hence “bytecode”.)

# Reference

* http://craftinginterpreters.com/a-map-of-the-territory.html#transpilers
* https://justinmeiners.github.io/lc3-vm/
