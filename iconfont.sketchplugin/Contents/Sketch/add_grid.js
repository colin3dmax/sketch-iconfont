@import "const/library.js";

var handleFont = function(context) {
  var handler  = context.command.name()
  var font     = Library.fetch.font(handler,context.plugin)

  // onRun function with context, json file path, title and font name.
  onRun(context,"/bundle/" + font.path,handler);
}

var onRun = function(context,path,fontname) {

  // check updates
  tools.checkPluginUpdate(context)

  var plugin        = context.plugin
  var doc           = context.document
  var selection     = context.selection.firstObject()
  var filtered      = false

  // 1. create a wrapper window
  var wrapper       = Library.Widgets.window("Add an icon - " + fontname, "Select an icon")

  // 2. create list properties
  json              = Library.fetch.json(path,plugin)
  icons             = [json objectForKey:@"icons"]
  unfilter          = [json objectForKey:@"icons"]
  count             = icons.count()
  width             = 545
  col_size          = Math.ceil(width / 50)
  row_size          = Math.ceil(count / col_size)
  height            = Math.ceil(row_size * 50)
  list              = [[NSScrollView alloc] initWithFrame:NSMakeRect(25,25,554,320)]

  // 3. create a button prototype for matrix
  prototype         = NSButtonCell.alloc().init()
  prototype.setButtonType(NSToggleButton)
  prototype.setTitle("-")
  prototype.setBezeled(true)
  prototype.setBezelStyle(NSThickSquareBezelStyle)

  // 4. create a matrix
  matrix            = [[NSMatrix alloc] initWithFrame:NSMakeRect(0, 45, width, height)
    mode:NSRadioModeMatrix prototype:prototype numberOfRows:row_size numberOfColumns:col_size];
  matrix.setFont([NSFont fontWithName:@""+fontname size:20.0])
  matrix.setCellSize(NSMakeSize(47, 47))
  matrix.setIntercellSpacing(NSMakeSize(2, 2))
  cellArray         = matrix.cells()

  // 5. loop all icons
  for (var c=0; c < count; c++) {
    // escape icon
    icon = Library.parse.escape('\\u' + icons[c].unicode)
    // get cell
    cell = cellArray.objectAtIndex(c)
    // set tooltip
    [matrix setToolTip:@""+icons[c].name forCell:cell];
    // set title
    cell.setTitle(icon)
    // set loop index into tag variable
    cell.setTag(c)
    // // cell needs to able to click itself
    cell.setTarget(self)
    cell.setAction("callAction:")
    // // click function
    cell.setCOSJSTargetFunction(function(sender) {
      wrapper.window.orderOut(nil)
      NSApp.stopModalWithCode(NSOKButton)
    })
  }

  // 6. create a searchbox to filter icons
  var searchbox   = [[NSTextField alloc] initWithFrame:NSMakeRect(200,357,150,24)]
  searchbox.setBackgroundColor(NSColor.clearColor())
  searchbox.setPlaceholderString(@"Search an icon...")
  searchbox.setTarget(self)
  searchbox.setAction("callAction:")
  searchbox.setCOSJSTargetFunction(function(sender) {
    if (filtered == true)
      icons = unfilter
    // get filter
    var q               = searchbox.stringValue()
    // search icons with filter
    icons               = Library.parse.research(q,icons)
    // find icons with the "key"
    newCount            = icons.unicodes.length
    newRows             = Math.ceil(newCount / col_size)
    newHeight           = Math.ceil(newRows * 50)
    if (newCount > col_size) {
      newCol = col_size
    } else{
      newCol = newCount
    }

    // 7. new frame and data
    newFrame = NSMakeRect(0, 45, width, newHeight);
    [matrix setFrame:newFrame];
    [matrix renewRows:newRows columns:newCol];

    for (var i=0; i < newCount; i++)
    {
      newCell = cellArray.objectAtIndex(i)
      [matrix setToolTip:@""+ icons.names[i] forCell:newCell];
      newCell.setTitle(icons.unicodes[i])
      newCell.setTag(i)
    }
    filtered = true
  }];

  wrapper.main.addSubview(searchbox)

  list.setDocumentView(matrix)
  list.setHasVerticalScroller(true)
  wrapper.main.addSubview(list)

  // 5. build window
  var response = NSApp.runModalForWindow(wrapper.window)

  selected                = matrix.selectedCell().tag()
  icon                    = matrix.selectedCell().title()

  if (filtered) {
    name                  = icons.names[selected] + ' - ' + fontname
  } else {
    name                  = icons[selected].name + ' - ' + fontname
  }

  // if is the response is ok, add icon
  if (response == NSOKButton) {
    Library.create.icon(doc,selection,fontname,name,icon)
  }

};
