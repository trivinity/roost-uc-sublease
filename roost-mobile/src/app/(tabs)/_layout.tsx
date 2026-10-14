import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

export default function TabLayout() {
  const c = useColors();
  const { unreadCount, shortlist } = useStore();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.brandText,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.bg, borderTopColor: c.border },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Discover", tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? "layers" : "layers-outline"} size={size} color={color} /> }} />
      <Tabs.Screen name="browse" options={{ title: "Browse", tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? "list" : "list-outline"} size={size} color={color} /> }} />
      <Tabs.Screen name="saved" options={{ title: "Saved", tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? "bookmark" : "bookmark-outline"} size={size} color={color} />, tabBarBadge: shortlist.length || undefined, tabBarBadgeStyle: { backgroundColor: c.brand } }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={size} color={color} />, tabBarBadge: unreadCount || undefined, tabBarBadgeStyle: { backgroundColor: c.brand } }} />
      <Tabs.Screen name="post" options={{ title: "Post", tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={size} color={color} /> }} />
    </Tabs>
  );
}
