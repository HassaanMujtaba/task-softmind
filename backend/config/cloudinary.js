import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: 'drqzsgwnz',
  api_key: '964834165294599',
  api_secret: 'LY2PGCF1QDsLZlr9o2WH4YbbnNc',
});

export default cloudinary;