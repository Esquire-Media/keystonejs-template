export default function BuildingsMode(mapRef) {
  var doubleClickZoom = {
    enable: function enable(ctx) {
      setTimeout(function () {
        // First check we've got a map and some context.
        if (
          !ctx.map ||
          !ctx.map.doubleClickZoom ||
          !ctx._ctx ||
          !ctx._ctx.store ||
          !ctx._ctx.store.getInitialConfigValue
        )
          return;
        // Now check initial state wasn't false (we leave it disabled if so)
        if (!ctx._ctx.store.getInitialConfigValue("doubleClickZoom")) return;
        ctx.map.doubleClickZoom.enable();
      }, 0);
    },
    disable: function disable(ctx) {
      setTimeout(function () {
        if (!ctx.map || !ctx.map.doubleClickZoom) return;
        // Always disable here, as it's necessary in some cases.
        ctx.map.doubleClickZoom.disable();
      }, 0);
    },
  };

  var BuildingsMode = {
    onSetup: function onSetup(opts) {
      var building = this.newFeature({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [[]],
        },
      });
      this.addFeature(building);
      this.clearSelectedFeatures();
      doubleClickZoom.disable(this);
      this.updateUIClasses({ mouse: "add" });
      this.setActionableState({
        trash: true,
      });
      return {
        building: building,
      };
    },

    onClick: function onClick(state, e) {
      const x = mapRef.current
        .queryRenderedFeatures([e.point.x, e.point.y])
        .filter((e) => {
          return e.layer?.id === "building";
        })
        .map((e) => e.toJSON());

      state.building.incomingCoords(x[0].geometry.coordinates);
      this.updateUIClasses({ mouse: "pointer" });
      this.changeMode("simple_select", { featuresId: state.building.id });
    },

    onStop: function onStop(state) {
      doubleClickZoom.enable(this);
      this.updateUIClasses({ mouse: "none" });
      this.activateUIButton();

      if (this.getFeature(state.building.id) === undefined) return;

      if (state.building.isValid()) {
        this.map.fire("draw.create", {
          features: [state.building.toGeoJSON()],
        });
      } else {
        this.deleteFeature([state.building.id], { silent: true });
        this.changeMode("simple_select", {}, { silent: true });
      }
    },

    onTap: function onTap(state, e) {
      const x = mapRef.current
        .queryRenderedFeatures([e.point.x, e.point.y])
        .filter((e) => {
          return e.layer?.id === "building";
        })
        .map((e) => e.toJSON());

      state.building.incomingCoords(x[0].geometry.coordinates);
      this.updateUIClasses({ mouse: "pointer" });
      this.changeMode("simple_select", { featuresId: state.building.id });
    },

    toDisplayFeatures: function toDisplayFeatures(state, geojson, display) {
      var isActivePolygon = geojson.properties.id === state.building.id;
      geojson.properties.active = isActivePolygon ? "true" : "false";
      if (!isActivePolygon) return display(geojson);
    },

    onTrash: function onTrash(state) {
      this.deleteFeature([state.rectangle.id], { silent: true });
      this.changeMode("simple_select");
    },
  };

  return BuildingsMode;
}
