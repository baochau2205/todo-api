import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';
test('See lable and onClick', async () => { 
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Apply" onClick={handleClick} />);
    await user.click(screen.getByRole('button', {name:'Apply'}));
    expect(handleClick).toHaveBeenCalledTimes(1);
});
test('Disable Button Will Be Locked', () => { 
    render(<Button label="Apply" disabled/>);
    expect(screen.getByRole('button')).toBeDisabled();
});