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
console.log(users);//users.toJSON(['profile.full_name'], [], null, 2));
