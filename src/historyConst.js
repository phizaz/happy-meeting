import { useRouterHistory } from 'react-router';
import { createHistory } from 'history';
console.log('createHistory:', createHistory);

const historyConfig = { basename: __BASENAME__ };

const history = useRouterHistory(createHistory)(historyConfig);

export default history;
