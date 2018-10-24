import { Model, ModelJS } from '../src/index.js';
import { users as data } from './data/users';

import Enum from './src/types/enum';
import Id from './src/types/id';
import Permalink from './src/types/permalink';

import Profile from './src/profile.model';
import Profiles from './src/profiles.collection';
import User from './src/user.model';
import Users from './src/users.collection';

const modeljs = new ModelJS();

modeljs.register([Enum, Id, Permalink, Profile, Profiles, User, Users]).boot();

const users = new Users(data);
console.log(users);
console.log(users.toJSON([], [], null, 2));
console.log(users.map((user: User) => {
  return (user as any).profile.first_name;
}));
users.length = 0;


(users[0] as any).profile.age = new Number(30);
console.log((users[0] as any).profile.toObject());
