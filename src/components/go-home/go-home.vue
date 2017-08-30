<template>
  <div class="go-wrapper">
    <router-link to="/home" class="icon-home"></router-link>
  </div>
</template>
<script>
  export default {};
</script>
<style lang="scss" scoped>
  .go-wrapper {
    position: fixed;
    bottom: 80px;
    right: 0;
    width: 50px;
    height: 50px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    background: rgba(0, 0, 0, 0.2);

    .icon-home {
      display: inline-block;
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-position: center;
      background-size: 30px;
      background-image: url(./home.png);
    }
  }
</style>
