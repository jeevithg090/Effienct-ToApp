import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Uncategorized');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadTodos();
    loadCategories();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem('todos');
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        setTodos(sortTodosByPriority(parsedTodos));
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem('categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const saveTodos = async (updatedTodos: Todo[]) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

  const saveCategories = async (updatedCategories: string[]) => {
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  };

  const sortTodosByPriority = (todos: Todo[]): Todo[] => {
    const priorityOrder: { [key in Todo['priority']]: number } = {
      high: 3,
      medium: 2,
      low: 1,
    };
    return [...todos].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  };

  const addTodo = () => {
    if (newTodo.trim().length === 0) return;
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      priority: 'medium',
      category: selectedCategory,
    };
    const updatedTodos = sortTodosByPriority([...todos, newTodoItem]);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setNewTodo('');
    setSelectedCategory('Uncategorized');
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(sortTodosByPriority(updatedTodos));
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(sortTodosByPriority(updatedTodos));
    saveTodos(updatedTodos);
  };

  const openPriorityModal = (id: string) => {
    setSelectedTodoId(id);
    setModalVisible(true);
  };

  const updatePriority = (priority: Todo['priority']) => {
    if (selectedTodoId) {
      const updatedTodos = todos.map(todo =>
        todo.id === selectedTodoId ? { ...todo, priority } : todo
      );
      setTodos(sortTodosByPriority(updatedTodos));
      saveTodos(updatedTodos);
    }
    setModalVisible(false);
    setSelectedTodoId(null);
  };

  const openCategoryModal = () => {
    setCategoryModalVisible(true);
  };

  const addCategory = () => {
    if (newCategory.trim().length === 0) return;
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setSelectedCategory(newCategory.trim());
    setNewCategory('');
    setCategoryModalVisible(false);
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);
  };

  // Assign a color to each category dynamically
  const getCategoryColor = (category: string) => {
    const colors = ['#007AFF', '#5856D6', '#FF9500', '#FF2D55', '#00C7BE'];
    const index = categories.indexOf(category) % colors.length;
    return colors[index >= 0 ? index : 0];
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={[styles.todo, item.completed && styles.todoCompleted, styles[`priority${item.priority}`]]}
        onPress={() => toggleTodo(item.id)}
        onLongPress={() => deleteTodo(item.id)}
      >
        <View style={styles.todoContent}>
          <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>
            {item.text}
          </Text>
          {item.category !== 'Uncategorized' && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryBadgeText}>🏷️ {item.category}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.priorityButton}
          onPress={() => openPriorityModal(item.id)}
        >
          <Text style={[styles.priorityDots, styles[`priorityDot${item.priority}`]]}>•••</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryOption = (category: string) => (
    <TouchableOpacity
      key={category}
      style={styles.categoryOption}
      onPress={() => selectCategory(category)}
    >
      <Text style={styles.categoryOptionText}>{category}</Text>
    </TouchableOpacity>
  );

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Todo List</Text>
        <View style={styles.datetimeContainer}>
          <Text style={styles.datetimeText}>{formattedDate}</Text>
          <Text style={[styles.datetimeText, styles.timeText]}>{formattedTime}</Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.input}
              value={newTodo}
              onChangeText={setNewTodo}
              placeholder="Enter Your Task"
              onSubmitEditing={addTodo}
            />
            <TouchableOpacity style={styles.filterButton} onPress={openCategoryModal}>
              <Text style={styles.filterButtonText}>{selectedCategory || 'Category'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addTodo}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={todos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      </View>

      {/* Priority Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Task Priority</Text>
            <TouchableOpacity
              style={[styles.priorityOption, styles.priorityOptionHigh]}
              onPress={() => updatePriority('high')}
            >
              <View style={[styles.priorityIndicator, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.priorityOptionText}>High Priority</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.priorityOption, styles.priorityOptionMedium]}
              onPress={() => updatePriority('medium')}
            >
              <View style={[styles.priorityIndicator, { backgroundColor: '#FFCC00' }]} />
              <Text style={styles.priorityOptionText}>Medium Priority</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.priorityOption, styles.priorityOptionLow]}
              onPress={() => updatePriority('low')}
            >
              <View style={[styles.priorityIndicator, { backgroundColor: '#34C759' }]} />
              <Text style={styles.priorityOptionText}>Low Priority</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {categories.length === 0 ? 'Add a Category' : 'Select or Add Category'}
            </Text>
            {categories.length > 0 ? (
              <FlatList
                data={categories}
                renderItem={({ item }) => renderCategoryOption(item)}
                keyExtractor={item => item}
                style={styles.categoryList}
              />
            ) : null}
            <View style={styles.newCategoryContainer}>
              <TextInput
                style={styles.newCategoryInput}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="New Category Name"
              />
              <TouchableOpacity style={styles.addCategoryButton} onPress={addCategory}>
                <Text style={styles.addCategoryButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  datetimeContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    alignItems: 'center',
  },
  datetimeText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 24,
    marginTop: 5,
    color: '#007AFF',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginRight: 5,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    marginBottom: 10,
  },
  todo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoCompleted: {
    backgroundColor: '#e8e8e8',
  },
  priorityhigh: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  prioritymedium: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFCC00',
  },
  prioritylow: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  categoryBadge: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  priorityButton: {
    padding: 10,
  },
  priorityDots: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityDothigh: {
    color: '#FF3B30',
  },
  priorityDotmedium: {
    color: '#FFCC00',
  },
  priorityDotlow: {
    color: '#34C759',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
    borderRadius: 8,
    marginBottom: 10,
  },
  priorityOptionHigh: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  priorityOptionMedium: {
    borderColor: '#FFCC00',
    borderWidth: 1,
  },
  priorityOptionLow: {
    borderColor: '#34C759',
    borderWidth: 1,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  priorityOptionText: {
    fontSize: 16,
    color: '#333',
  },
  categoryOption: {
    padding: 12,
    width: '100%',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  newCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  newCategoryInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  addCategoryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryList: {
    width: '100%',
    maxHeight: 150,
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});