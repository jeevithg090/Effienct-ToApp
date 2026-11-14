import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import App from '../App';
import { STORAGE_KEYS } from '../src/lib/storage';

async function renderApp() {
  render(<App />);
  await screen.findByText('Your list is empty');
}

function addTask(text: string) {
  fireEvent.changeText(screen.getByLabelText('New task'), text);
  fireEvent.press(screen.getByRole('button', { name: 'Add task' }));
}

beforeEach(async () => {
  jest.useFakeTimers();
  await AsyncStorage.clear();
});

describe('App', () => {
  it('shows a validation message for an empty task', async () => {
    await renderApp();
    fireEvent.press(screen.getByRole('button', { name: 'Add task' }));
    expect(screen.getByText('Please enter a task before adding it.')).toBeTruthy();
  });

  it('adds a task and persists it', async () => {
    await renderApp();
    addTask('Write the README');
    expect(await screen.findByText('Write the README')).toBeTruthy();
    await waitFor(async () => {
      const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEYS.todos)) ?? '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({ text: 'Write the README', priority: 'medium' });
    });
  });

  it('toggles completion and filters', async () => {
    await renderApp();
    addTask('Ship it');
    fireEvent.press(await screen.findByRole('checkbox', { name: 'Ship it' }));
    expect(screen.getByText('1 of 1 task completed')).toBeTruthy();

    fireEvent.press(screen.getByRole('tab', { name: /Active/ }));
    expect(screen.getByText('All caught up')).toBeTruthy();
  });

  it('deletes a task and restores it with undo', async () => {
    await renderApp();
    addTask('Temporary');
    fireEvent.press(await screen.findByRole('button', { name: 'Delete “Temporary”' }));
    expect(screen.queryByText('Temporary')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByText('Temporary')).toBeTruthy();
  });

  it('changes priority through the priority dialog', async () => {
    await renderApp();
    addTask('Pay rent');
    fireEvent.press(await screen.findByRole('button', { name: /Change priority of “Pay rent”/ }));
    fireEvent.press(screen.getByRole('radio', { name: 'High priority' }));
    expect(await screen.findByText('High')).toBeTruthy();
  });

  it('creates a category and tags new tasks with it', async () => {
    await renderApp();
    fireEvent.press(screen.getByRole('button', { name: /Change category/ }));
    fireEvent.changeText(screen.getByLabelText('New category name'), 'Work');
    fireEvent.press(screen.getByRole('button', { name: 'Create' }));
    addTask('Prepare slides');
    expect(await screen.findByText('Prepare slides')).toBeTruthy();
    expect(screen.getAllByText('Work').length).toBeGreaterThanOrEqual(2);
  });

  it('loads tasks saved by a previous session', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.todos,
      JSON.stringify([{ id: '1', text: 'From last time', completed: false, priority: 'high' }]),
    );
    render(<App />);
    expect(await screen.findByText('From last time')).toBeTruthy();
  });

  it('shows an error state with retry when storage fails', async () => {
    const spy = jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
    render(<App />);
    expect(await screen.findByText('Couldn’t load your tasks')).toBeTruthy();
    spy.mockRestore();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    });
    expect(await screen.findByText('Your list is empty')).toBeTruthy();
  });
});

it('warns when a change cannot be saved', async () => {
  await renderApp();
  const spy = jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));
  addTask('Will not persist');
  expect(
    await screen.findByText('Your latest change could not be saved on this device.'),
  ).toBeTruthy();
  spy.mockRestore();
});

it('clears completed tasks', async () => {
  await renderApp();
  addTask('Done already');
  addTask('Still open');
  fireEvent.press(await screen.findByRole('checkbox', { name: 'Done already' }));
  fireEvent.press(screen.getByRole('button', { name: 'Clear completed' }));
  expect(screen.queryByText('Done already')).toBeNull();
  expect(screen.getByText('Still open')).toBeTruthy();
  expect(screen.getByText('Cleared 1 completed task')).toBeTruthy();
});

it('deleting a category untags its tasks', async () => {
  await renderApp();
  fireEvent.press(screen.getByRole('button', { name: /Change category/ }));
  fireEvent.changeText(screen.getByLabelText('New category name'), 'Errands');
  fireEvent.press(screen.getByRole('button', { name: 'Create' }));
  addTask('Post a parcel');
  await screen.findByText('Post a parcel');
  fireEvent.press(screen.getByRole('button', { name: /Change category/ }));
  fireEvent.press(screen.getByRole('button', { name: 'Delete category Errands' }));
  fireEvent.press(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByText('Errands')).toBeNull();
  expect(screen.getByText('No category')).toBeTruthy();
});
