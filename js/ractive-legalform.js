(function(Ractive, jmespath) {
    var ractiveEngine = new RactiveLegalFormEngine(jmespath);

    window.RactiveLegalForm = Ractive.extend(ractiveEngine);
})(Ractive, jmespath);
