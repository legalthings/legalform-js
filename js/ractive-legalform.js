(function($, Ractive, jmespath) {
    var ractiveEngine = new RactiveLegalFormEngine($, jmespath);

    window.RactiveLegalForm = Ractive.extend(ractiveEngine);
})(jQuery, Ractive, jmespath);
