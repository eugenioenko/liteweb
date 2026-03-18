package auth

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
)

type SessionStore struct {
	mu     sync.RWMutex
	tokens map[string]struct{}
}

func NewSessionStore() *SessionStore {
	return &SessionStore{
		tokens: make(map[string]struct{}),
	}
}

func (s *SessionStore) Create() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	token := hex.EncodeToString(b)
	s.mu.Lock()
	s.tokens[token] = struct{}{}
	s.mu.Unlock()
	return token, nil
}

func (s *SessionStore) Valid(token string) bool {
	s.mu.RLock()
	_, ok := s.tokens[token]
	s.mu.RUnlock()
	return ok
}

func (s *SessionStore) Delete(token string) {
	s.mu.Lock()
	delete(s.tokens, token)
	s.mu.Unlock()
}
