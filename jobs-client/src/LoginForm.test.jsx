import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from './AuthContext';
import LoginForm from './LoginForm';

vi.mock('./socket', () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn(), connect: vi.fn(), disconnect: vi.fn() },
}));

function renderForm(login = vi.fn()) {
    render(
        <AuthContext.Provider value={{ login }}>
            <LoginForm />
        </AuthContext.Provider>
    );
    return login;
}

test('submit gửi đúng email và mật khẩu', async () => {
    const user = userEvent.setup();
    const login = renderForm(vi.fn().mockResolvedValue());

    await user.type(screen.getByPlaceholderText('Email'), 'an@test.com');
    await user.type(screen.getByPlaceholderText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(login).toHaveBeenCalledWith('an@test.com', '123456');
});

test('server báo lỗi thì hiện thông báo', async () => {
    const user = userEvent.setup();
    renderForm(vi.fn().mockRejectedValue(new Error('Incorrect email or password')));

    await user.type(screen.getByPlaceholderText('Email'), 'an@test.com');
    await user.type(screen.getByPlaceholderText('Password'), 'sai');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Incorrect email or password')).toBeInTheDocument();
});