# jQueryForm

Advanced jQuery Form - UI Widgets

Replace a list of radio (or checkbox) buttons by an full featured button group or even a tree view!

## Button group

```html
<div id="demo-button-group">
  <label>Item 1<input type="radio" checked /></label>
  <label>Item 2<input type="radio" /></label>
  <label>Item 3<input type="radio" /></label>
  <label>Item 4<input type="radio" disabled /></label>
</div>

<script>
  $("#demo-button-group").avnButtonGroup();
</script>
```

## Tree view

```html
<div id="demo-tree-view">
  <ul>
    <li>
      <label>Item 1<input type="checkbox" name="item-1" value="1" checked></label>
    </li>
    <li>
      <label>Item 2<input type="checkbox" name="item-2" value="2"></label>
      <ul>
        <li>
          <label>Item 2.1<input type="checkbox" name="item-3" value="2.1"></label>
        </li>
        <li>
          <label>Item 2.2<input type="checkbox" name="item-4" value="2.2"></label>
        </li>
        <li>
          <label>Item 2.3<input type="checkbox" name="item-5" value="2.3"></label>
        </li>
      </ul>
    </li>
    <li>
      <label>Item 3<input type="checkbox" name="item-6" value="3" disabled></label>
    </li>
  </ul>
</div>

<script>
  $("#demo-tree-view").avnTreeView();
</script>
```
