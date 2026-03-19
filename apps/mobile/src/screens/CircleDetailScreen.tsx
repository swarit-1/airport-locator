import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Text, Button, Card, Badge, Divider, themeColors, themeSpacing, themeRadii } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';
import * as api from '../services/api';

export function CircleDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'CircleDetail'>>();
  const { id } = route.params;
  const [circle, setCircle] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    api.getStore()
      .then((store) => {
        const c = store.circles?.find(([cid]: [string]) => cid === id);
        if (c) setCircle(c[1]);
        setMembers((store.members ?? []).filter((m: any) => m.circle_id === id && m.status === 'active'));
        setMessages(
          (store.messages ?? [])
            .filter((m: any) => m.circle_id === id)
            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function handleSend() {
    if (!newMessage.trim()) return;
    const msg = {
      id: `msg-${Date.now()}`,
      circle_id: id,
      sender: 'You',
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      type: 'text',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="bodySmall" color={themeColors.ink[400]}>Loading...</Text>
      </View>
    );
  }

  if (!circle) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="h3" color={themeColors.ink[400]}>Circle not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
      <View style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}>
        {/* Header */}
        <Card elevation="raised" style={{ margin: themeSpacing[4], marginBottom: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text variant="h3">{circle.airport_name ?? circle.airport_iata}</Text>
              <Text variant="caption" color={themeColors.ink[500]}>
                {circle.creator_name} — {circle.neighborhood ?? 'Nearby'}
              </Text>
            </View>
            <Badge
              label={circle.status}
              variant={circle.status === 'open' ? 'success' : 'warning'}
            />
          </View>
          <Divider />
          <View style={{ flexDirection: 'row', gap: themeSpacing[4] }}>
            <View>
              <Text variant="caption" color={themeColors.ink[400]}>Riders</Text>
              <Text variant="body" weight="semibold">{circle.current_members}/{circle.max_members}</Text>
            </View>
            <View>
              <Text variant="caption" color={themeColors.ink[400]}>Savings</Text>
              <Text variant="body" weight="semibold" color={themeColors.success[500]}>
                ~${((circle.estimated_savings_cents ?? 0) / 100).toFixed(0)}
              </Text>
            </View>
            <View>
              <Text variant="caption" color={themeColors.ink[400]}>Extra time</Text>
              <Text variant="body" weight="semibold">+{circle.estimated_extra_minutes ?? 0}m</Text>
            </View>
          </View>
        </Card>

        {/* Members */}
        <View style={{ paddingHorizontal: themeSpacing[4], paddingVertical: themeSpacing[2] }}>
          <Text variant="caption" color={themeColors.ink[400]}>
            Members: {members.map((m) => m.user_name).join(', ')}
          </Text>
        </View>

        {/* Chat */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[2] }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                alignSelf: msg.type === 'system' ? 'center' : msg.sender === 'You' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              {msg.type === 'system' ? (
                <Text variant="caption" color={themeColors.ink[400]} align="center">
                  {msg.content}
                </Text>
              ) : (
                <View
                  style={{
                    backgroundColor: msg.sender === 'You' ? themeColors.brand[600] : themeColors.surface.elevated,
                    padding: themeSpacing[3],
                    borderRadius: themeRadii.xl,
                  }}
                >
                  {msg.sender !== 'You' && (
                    <Text variant="caption" weight="semibold" color={themeColors.brand[600]} style={{ marginBottom: 2 }}>
                      {msg.sender}
                    </Text>
                  )}
                  <Text variant="bodySmall" color={msg.sender === 'You' ? '#FFFFFF' : themeColors.ink[800]}>
                    {msg.content}
                  </Text>
                  <Text variant="overline" color={msg.sender === 'You' ? 'rgba(255,255,255,0.6)' : themeColors.ink[300]} style={{ marginTop: 2 }}>
                    {msg.time}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={{ flexDirection: 'row', padding: themeSpacing[3], gap: themeSpacing[2], borderTopWidth: 1, borderTopColor: themeColors.ink[100], backgroundColor: themeColors.surface.primary }}>
          <TextInput
            style={{
              flex: 1,
              height: 44,
              borderWidth: 1,
              borderColor: themeColors.ink[200],
              borderRadius: themeRadii.xl,
              paddingHorizontal: themeSpacing[3],
              fontSize: 16,
              color: themeColors.ink[900],
            }}
            placeholder="Message..."
            placeholderTextColor={themeColors.ink[300]}
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Button title="Send" size="sm" onPress={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
