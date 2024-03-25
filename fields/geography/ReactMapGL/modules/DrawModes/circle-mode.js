import circle from "@turf/circle";

export default function CircleMode() {
  const DEFAULT_RADIUS_IN_KM = 2;

  const doubleClickZoom = {
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

  const CircleMode = {
    onSetup: function onSetup(opts) {
      console.log("circle opts: ", opts)
      let circle = this.newFeature({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [[]]
        }
      })
      this.addFeature(circle);
      this.clearSelectedFeatures();
      doubleClickZoom.disable(this);
      this.updateUIClasses({ mouse: "add" })
      this.setActionableState({
        trash: true,
      })
      return { circle, initialRadiusInKm: opts.initialRadiusInKm || DEFAULT_RADIUS_IN_KM, initialCoords: opts.coords }
    },

    onClick: function onClick(state, e) {
      console.log("circle state: ", state)
      console.log("circle event: ", e)
      let center;
      if (state.incomingCoords !== undefined) {
        center = [state.initialCoords.longitude, state.initialCoords.latitude]
      } else if (e.lngLat) {
        center = [e.lngLat.lng, e.lngLat.lat]
      }
      const circleFeature = circle(center, state.initialRadiusInKm * 1.60934)
      state.circle.incomingCoords(circleFeature.geometry.coordinates)
      state.circle.properties.center = center;
      state.circle.properties.radiusInKm = state.initialRadiusInKm;
      this.updateUIClasses({ mouse: "pointer" })
      this.changeMode(e.target._controls.filter((e) => Object.keys(e).includes("getSelected"))[0].options.defaultMode || "simple_select", { featuresId: state.circle.id })
    },

    getCircle: function getCircle(coordinates, radius) {
      const newCircle = circle(coordinates, radius * 1.60934)
      return newCircle
    },

    onStop: function onStop(state) {
      doubleClickZoom.enable(this);
      this.updateUIClasses({ mouse: "none" });
      this.activateUIButton();

      if (this.getFeature(state.circle.id) === undefined) return;

      if (state.circle.isValid()) {
        this.map.fire("draw.create", {
          features: [state.circle.toGeoJSON()],
        });
      } else {
        this.deleteFeature([state.circle.id], { silent: true });
        this.changeMode("simple_select", {}, { silent: true });
      }
    },

    onTap: function onTap(state, e) {
      const center = [e.lngLat.lng, e.lngLat.lat]
      const circleFeature = circle(center, state.initialRadiusInKm)
      state.circle.incomingCoords(circleFeature.geometry.coordinates)
      state.circle.properties.center = center;
      state.circle.properties.radiusInKm = state.initialRadiusInKm;
      this.updateUIClasses({ mouse: "pointer" })
      this.changeMode("simple_select", { featuresId: state.circle.id })
    },

    toDisplayFeatures: function toDisplayFeatures(state, geojson, display) {
      var isActivePolygon = geojson.properties.id === state.circle.id;
      geojson.properties.active = isActivePolygon ? "true" : "false";
      if (!isActivePolygon) return display(geojson);
    },

    onTrash: function onTrash(state) {
      this.deleteFeature([state.circle.id], { silent: true });
      this.changeMode("simple_select");
    },
  };

  return CircleMode
}