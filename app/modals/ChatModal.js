import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ChatModal = ({ visible, onClose, riderName, riderId, driverId, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Handle initial message and existing messages
  useEffect(() => {
    if (initialMessage) {
      console.log("Received new chat message in ChatModal:", initialMessage);
      const newMsg = {
        id: Date.now(),
        text: initialMessage.message,
        sender: 'rider',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      
      // Scroll to the latest message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [initialMessage]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMessageObj = {
        id: Date.now(),
        text: newMessage,
        sender: 'driver',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
      
      // Here you would send the message to your backend
      // sendMessageToBackend(newMessage, driverId, riderId);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'driver' ? styles.driverMessage : styles.riderMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'driver' ? styles.driverMessageText : styles.riderMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.timestamp,
        item.sender === 'driver' ? styles.driverTimestamp : styles.riderTimestamp
      ]}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{riderName || 'Chat'}</Text>
          </View>

          {/* Messages */}
          <FlatList
            ref={scrollViewRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
          />

          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={newMessage.trim() ? "#2196F3" : "#ccc"} 
              />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
  },
  driverMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3',
    borderTopRightRadius: 5,
  },
  riderMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#D3D3D3',
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  driverMessageText: {
    color: '#fff',
  },
  riderMessageText: {
    color: '#000',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  driverTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  riderTimestamp: {
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
});

export default ChatModal; 