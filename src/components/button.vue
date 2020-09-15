<template>
  <label
    class="btn"
    tabindex="1"
  >
    <input type="checkbox">
    <span>
      <slot></slot>
    </span>
  </label>
</template>

<script>
export default {
  name: 'Button'
}
</script>
<style lang="scss">
.btn {
  display: block;
  width: 100px;
  outline: 0;
  overflow: hidden;
  position: relative;
  transition: 0.3s;
  cursor: pointer;
  user-select: none;
  height: 50px;
  text-align: center;
  line-height: 50px;
  font-size: 20px;
  background: tomato;
  color: #fff;
  border-radius: 10px;
}
.btn > span:after {
  content: "";
  position: absolute;
  background: transparent;
  border-radius: 50%;
  width: 100%;
  padding-top: 100%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
}
.btn:active {
  background: orangered;
}
.btn > input[type="checkbox"] {
  display: none;
}
.btn > input[type="checkbox"] + span:after {
  animation: ripple-in 1s;
}
.btn > input[type="checkbox"]:checked + span:after {
  animation: ripple-out 1s;
}
@keyframes ripple-in {
  from {
    transform: translate(-50%, -50%) scale(0);
    background: rgba(0, 0, 0, 0.25);
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    background: transparent;
  }
}
@keyframes ripple-out {
  from {
    transform: translate(-50%, -50%) scale(0);
    background: rgba(0, 0, 0, 0.25);
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    background: transparent;
  }
}
</style>