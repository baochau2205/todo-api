import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import RequireAuth from './RequireAuth';

vi.mock('./socket', () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn(), connect: vi.fn(), disconnect: vi.fn() },
}));

function renderAt(user, loading = false) {
    render(
        <AuthContext.Provider value={{ user, loading }}>
            <MemoryRouter initialEntries={['/my-jobs']}>
                <Routes>
                    <Route path="/" element={<p>Trang chủ</p>} />
                    <Route path="/my-jobs" element={
                        <RequireAuth><p>Job của tôi</p></RequireAuth>
                    } />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

test('đang tải thì hiện Loading', () => {
    renderAt(null, true);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('chưa login thì về trang chủ', () => {
    renderAt(null);
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.queryByText('Job của tôi')).not.toBeInTheDocument();
});

test('đã login thì thấy trang', () => {
    renderAt({ id: 1, email: 'an@test.com' });
    expect(screen.getByText('Job của tôi')).toBeInTheDocument();
});