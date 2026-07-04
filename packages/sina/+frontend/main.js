class Main extends App {
  onStart() {
    this.main = ui.addLayout("main", "Linear", "VCenter,FillXY");
    ui.setTheme(ui.theme.dark ? "light" : "dark");

    var list = [
      ["Train AI Model", "Begin a YOLO session to train based on datasets"],
      ["Benchmark Model", "Run a model benchmark and view results"],
      ["Compare Models", "view model results and compare against others"],
      ["Import Dataset", "Upload images or run a document scanner."],
      ["Create Synthetic Data", "Manage the synthetic data creation pipeline"],
      ["View Database", "View, modify database information or run SQL"],
    ];
    this.lst = ui.addList(this.main, list, "Dense, Divider", 0.6);
    this.lst.setOnTouch(this.lstFn);
  }
  lstFn(item) {
    switch (item) {
      case "Train AI Model":
    }
  }
}
