const express = require('express');
const Project = require('../models/Project');
const upload = require('../middleware/uploadMiddleware');
const Papa = require('papaparse');
const authenticateToken = require('../middleware/authenticateToken');
const mongoose = require('mongoose'); // Import mongoose for ObjectId generation
const router = express.Router();
const logger = require('../config/logger');

router.post('/create-project', upload.single('file'), (req, res) => {
  const { name, description } = req.body;
  if (!req.file) {
    logger.warn('Create project: No file uploaded');
    return res.status(400).send('No file uploaded');
  }

  const csvData = req.file.buffer.toString();
  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        // Generate ObjectId for each record and log the data being processed
        const dataWithIds = results.data.map(row => ({
          _id: new mongoose.Types.ObjectId(),
          ...row
        }));

        logger.info(`Parsed CSV data with ObjectIds: ${JSON.stringify(dataWithIds)}`); // gpt_pilot_debugging_log
        const project = new Project({ name, description, data: dataWithIds });
        await project.save();
        logger.info('Project created successfully');
        res.status(201).json(project);
      } catch (error) {
        logger.error('Error creating project:', { error: error.message, stack: error.stack });
        res.status(500).json({ error: "Error creating project", details: error.message });
      }
    }, 
    error: (error) => {
      logger.error('Error parsing CSV file:', {error: error.message, stack: error.stack});
      res.status(400).json({ error: "Error parsing CSV file", details: error.message });
    }
  });
});

router.post('/sample/search', authenticateToken, async (req, res) => {
  try {
    const { projectId, phone, name, surveyLink } = req.body;
    logger.info(`Searching samples for project ${projectId} with query params`, req.body);

    let query = {};
    if (phone) query['data.phone'] = phone;
    if (name) query['data.name'] = name;
    if (surveyLink) query['data.surveyLink'] = surveyLink;

    const project = await Project.findById(projectId);

    if (!project) {
      logger.warn(`Project not found: ${projectId}`, {error: error.message, stack: error.stack});
      return res.status(404).send({ message: 'Project not found' });
    }

    const filteredData = project.data.filter(sample => Object.entries(query).every(([key, value]) => sample[key.split('.')[1]] && sample[key.split('.')[1]].includes(value)));

    logger.info(`Samples search completed for project ${projectId}`);
    res.status(200).json(filteredData);
  } catch (error) {
    logger.error('Error searching project samples:', { message: error.message, stack: error.stack });
    res.status(500).send({error: 'Error searching project samples', detailed: error.message});
  }
});

router.get('/sample/global-search', authenticateToken, async (req, res) => {
  const { phone } = req.query;
  
  logger.info(`Initiated global search for phone number: ${phone}`); // Logging for initiation of global search

  if (!phone) {
    return res.status(400).send({ message: 'Phone number query parameter is required for global search.' });
  }

  try {
    const projects = await Project.find({ 'data.phone': phone });
    const results = projects.map(project => {
      return {
        projectId: project._id,
        projectName: project.name,
        samples: project.data.filter(sample => sample.phone === phone)
      };
    });

    logger.info(`Global search completed. Found ${results.length} project(s).`); // Logging for successful completion of search
    res.status(200).json(results);
  } catch (error) {
    logger.error('Error during global phone search:', { message: error.message, stack: error.stack }); // Log with full error trace
    res.status(500).send({ error: 'Error searching for phone number across all projects' });
  }
});

router.post('/sample', async (req, res) => {
  const { projectId } = req.body;
  console.log(`Received projectId: ${projectId}`);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn(`Project not found: ${projectId}`);
      return res.status(404).send('Project not found');
    }
    const samples = project.data.slice(startIndex, startIndex + limit);
    logger.info(`Fetched samples for project ${projectId} with pagination. Page: ${page}, Limit: ${limit}`);
    res.status(200).json({
      totalPages: Math.ceil(project.data.length / limit),
      currentPage: page,
      samples,
    });
  } catch (error) {
    logger.error('Error fetching sample records from project:', { message: error.message, stack: error.stack });
    res.status(500).send('Failed to fetch sample records');
  }
});

router.put('/update-project/:projectId', async (req, res) => {
  const projectId = req.params.projectId;
  const { updatedData } = req.body;

  await Project.findByIdAndUpdate(projectId, { $set: { data: updatedData } });

  logger.info(`Project ${projectId} updated successfully`);
  res.status(200).json({ message: 'Project updated successfully' });
});

// Adding the new PATCH method as per instructions
router.patch('/update-project-data/:projectId', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return res.status(400).send({ error: "Invalid update data provided. 'updates' should be an array of changes." });
  }

  try {
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).send({ error: "Project not found." });
    }

    project.data = updates;
    await project.save();

    logger.info(`Project sample data updated successfully for ${projectId}`, { projectId });
    res.status(200).send({ message: 'Project sample data updated successfully.', project });
  } catch (error) {
    logger.error(`Failed to update project data for ${projectId}: ${error}`, { error: error.message, stack: error.stack });
    res.status(500).send({ message: 'Failed to update project data.', error: error.message });
  }
});

router.get('/:projectId/sample', async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn(`Project not found: ${projectId}`); // gpt_pilot_debugging_log
      return res.status(404).send('Project not found');
    }
    const samples = project.data.slice(startIndex, startIndex + limit);
    logger.info(`Fetched samples for project ${projectId}, Page: ${page}, Limit: ${limit}`); // gpt_pilot_debugging_log
    res.status(200).json({
      totalPages: Math.ceil(project.data.length / limit),
      currentPage: page,
      samples,
    });
  } catch (error) {
    logger.error(`Error fetching sample records from project: ${projectId}, Error: ${error}`, { message: error.message, stack: error.stack }); // gpt_pilot_debugging_log
    res.status(500).send('Failed to fetch sample records');
  }
});

module.exports = router;
