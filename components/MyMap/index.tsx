import { View, Text, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { ExpoLeaflet, MapLayer, MapMarker, LeafletWebViewEvent } from "expo-leaflet";
import * as Location from "expo-location";

const mapLayer: MapLayer = {
  baseLayerName: "CyclOSM",
  baseLayerIsChecked: true,
  layerType: "TileLayer",
  baseLayer: true,
  url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
};

const pinIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C12.5523 22 13 21.5523 13 21V18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18V21C11 21.5523 11.4477 22 12 22Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C8.13401 0 5 3.13401 5 7C5 11.2687 12 17 12 17C12 17 19 11.2687 19 7C19 3.13401 15.866 0 12 0ZM7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7Z" fill="currentColor"/>
  </svg>
`;

export default function MyMap() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setIsLoading(true);

    // Clear existing markers
    setMarkers([]);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      setIsLoading(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
    setIsLoading(false);
  };

  const handleMapEvent = (event: LeafletWebViewEvent) => {
    if (event.tag === "onMapClicked") {
      const { lat, lng } = event.location;
      const newMarker: MapMarker = {
        id: `${markers.length + 1}`,
        position: { lat, lng },
        icon: pinIcon,
        size: [24, 24],
      };

      // Add the new marker
      setMarkers([...markers, newMarker]);

      // If there are at least two markers, create a route between the first two markers
      if (markers.length === 1) {
        createRoute([markers[0], newMarker]);
      }

      // If there are more than two markers, create a route between the last two markers
      if (markers.length >= 2) {
        createRoute(markers.slice(-2));
      }
    }
  };

  const createRoute = (selectedMarkers: MapMarker[]) => {
    const [startMarker, endMarker] = selectedMarkers;
    const startLocation = startMarker.position;
    const endLocation = endMarker.position;

    // Logic to create route goes here
    // For demonstration purposes, let's just show an alert
    Alert.alert(
      "Route created",
      `You have selected two points: Start (${startLocation.lat}, ${startLocation.lng}) and End (${endLocation.lat}, ${endLocation.lng})`
    );
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <Text>Accessing geolocation...</Text>
        </View>
      ) : (
        <ExpoLeaflet
          mapLayers={[mapLayer]}
          mapMarkers={markers}
          mapCenterPosition={userLocation || { lat: -25.35084, lng: -51.47921 }} // Use userLocation if available, otherwise default to a fixed location
          maxZoom={20}
          zoom={15}
          loadingIndicator={() => <ActivityIndicator />}
          onMessage={handleMapEvent}
        />
      )}
    </View>
  );
}