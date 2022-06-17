<style lang="scss" global>
  @import './Dropdown.scss';
</style>

<script lang="ts">
  export let title = '';
</script>

<div class="function-junctions-dropdown">
  <div class="function-junctions-dropdown-inner">
    <div class="function-junctions-dropdown-title">{title}</div>
    <div class="function-junctions-dropdown-select">
      <slot />
    </div>
  </div>
</div>