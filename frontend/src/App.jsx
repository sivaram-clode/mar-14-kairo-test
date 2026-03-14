import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote } from './api';
import './App.css';

const AUTOSAVE_DELAY = 1000; // ms

function NoteItem({ note, isSelected, onClick, onDelete }) {
  const preview = note.body ? note.body.slice(0, 80) + (note.body.length > 80 ? '…' : '') : '';

  return (
    <div
      className={`note-item${isSelected ? ' selected' : ''}`}
      onClick={() => onClick(note)}
    >
      <div className="note-item-title">{note.title || 'Untitled'}</div>
      <div className="note-item-preview">{preview || <em>No content</em>}</div>
      <button
        className="delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note);
        }}
        title="Delete note"
        aria-label="Delete note"
      >
        ✕
      </button>
    </div>
  );
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const autosaveTimer = useRef(null);
  const selectedNoteRef = useRef(null);

  // Keep ref in sync for autosave closure
  selectedNoteRef.current = selectedNote;

  const loadNotes = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      setError('Could not load notes. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Autosave when title/body change and a note is selected
  useEffect(() => {
    if (!selectedNoteRef.current) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      const note = selectedNoteRef.current;
      if (!note) return;
      try {
        setSaving(true);
        const updated = await updateNote(note.id, { title, body });
        setNotes((prev) =>
          prev.map((n) => (n.id === updated.id ? updated : n))
        );
      } catch {
        // silent autosave failure
      } finally {
        setSaving(false);
      }
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(autosaveTimer.current);
  }, [title, body]);

  const selectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setBody(note.body);
  };

  const handleNewNote = async () => {
    try {
      const newNote = await createNote({ title: 'New Note', body: '' });
      setNotes((prev) => [newNote, ...prev]);
      selectNote(newNote);
    } catch {
      setError('Failed to create note.');
    }
  };

  const handleDeleteRequest = (note) => {
    setConfirmDelete(note);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteNote(confirmDelete.id);
      setNotes((prev) => prev.filter((n) => n.id !== confirmDelete.id));
      if (selectedNote?.id === confirmDelete.id) {
        setSelectedNote(null);
        setTitle('');
        setBody('');
      }
    } catch {
      setError('Failed to delete note.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">📝 Notes</h1>
          <button className="new-note-btn" onClick={handleNewNote}>
            + New
          </button>
        </div>
        <div className="search-box">
          <input
            type="search"
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="notes-list">
          {loading && <div className="status-msg">Loading…</div>}
          {error && <div className="status-msg error">{error}</div>}
          {!loading && !error && filteredNotes.length === 0 && (
            <div className="status-msg">
              {search ? 'No matching notes.' : 'No notes yet. Create one!'}
            </div>
          )}
          {filteredNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={selectedNote?.id === note.id}
              onClick={selectNote}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className="editor">
        {selectedNote ? (
          <>
            <div className="editor-header">
              <input
                type="text"
                className="title-input"
                placeholder="Note title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="save-status">{saving ? 'Saving…' : 'Saved'}</span>
            </div>
            <textarea
              className="body-textarea"
              placeholder="Write your note here…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </>
        ) : (
          <div className="empty-editor">
            <p>Select a note or create a new one.</p>
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete note?</h2>
            <p>
              "<strong>{confirmDelete.title || 'Untitled'}</strong>" will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
