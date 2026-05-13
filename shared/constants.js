// shared/constants.js — shared enums and lookup data used by both client and server
const BRANCHES = [
  'Computer Science',
  'Electrical',
  'Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const SUBJECTS = {
  'Computer Science': ['Data Structures', 'Algorithms', 'Operating Systems', 'Databases', 'Networks', 'Machine Learning'],
  'Electrical': ['Circuit Theory', 'Signals & Systems', 'Power Systems', 'Control Systems', 'Electromagnetics'],
  'Electronics': ['Analog Circuits', 'Digital Electronics', 'VLSI Design', 'Embedded Systems', 'Communication Systems'],
  'Mechanical': ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Machine Design', 'Manufacturing'],
  'Civil': ['Structural Analysis', 'Geotechnical Engineering', 'Fluid Mechanics', 'Transportation', 'Surveying'],
  'Chemical': ['Thermodynamics', 'Mass Transfer', 'Heat Transfer', 'Reaction Engineering', 'Process Control'],
}

module.exports = { BRANCHES, LEVELS, SUBJECTS }
