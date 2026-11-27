import { render, screen } from '@testing-library/react';
import { apiFetch } from '../api';
import { AuthContext } from '../AuthContext';
import JobsPage from './JobsPage';

vi.mock('../api', () => ({ apiFetch: vi.fn() }));
vi.mock('../socket', () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn(), connect: vi.fn(), disconnect: vi.fn() },
}));

function renderPage() {
    render(
        <AuthContext.Provider value={{ user: null }}>
            <JobsPage />
        </AuthContext.Provider>
    );
}

beforeEach(() => vi.clearAllMocks());

test('hiện loading rồi hiện danh sách job', async () => {
    apiFetch.mockResolvedValue([
        { id: 1, title: 'Frontend Developer', company: 'ABC' },
        { id: 2, title: 'Backend Developer', company: 'XYZ' },
    ]);
    renderPage();
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
    expect(await screen.findByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
});

test('API lỗi thì hiện thông báo', async () => {
    apiFetch.mockRejectedValue(new Error('Không tải được danh sách'));
    renderPage();
    expect(await screen.findByText('Không tải được danh sách')).toBeInTheDocument();
    expect(screen.queryByText(/đang tải/i)).not.toBeInTheDocument();
});