import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';

import DATA from './data';

function ViewRoutes() {
  return (
    <Routes>
      <Route key={location.pathname} index exact path="/" element={<Home />} />
      {DATA.map((item) => (
        <Route
          key={item.id}
          exact
          path={`detail/${item.path}`}
          element={
            <Detail
              key={item.id}
              title={item.title}
              description={item.description}
              image={item.image}
              id={item.id}
              path={item.path}
            />
          }
        />
      ))}
    </Routes>
  );
}

export default ViewRoutes;
