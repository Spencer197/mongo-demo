const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false//Added due to MongoDB warning
})

  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

  const courseSchema = new mongoose.Schema({
    name: { 
      type: String, 
      required: true,
      minlength: 3,
      maxlength: 32,
      //match: /pattern/ - not needed for course name. 
    },
    category: {
        type: String,
        required: true,
        enum: ['web', 'mobile', 'network'],
        lowercase: true,
        //uppercase: true, - use only one case, not both.
        trim: true
    },
  author: String,
  tags: {
    type: Array,
    validate: {
      //isAsync: true, - No longer needed in Mongoose 6 and above.
      validator: function(v) {
        return new Promise((resolve) => {
        setTimeout(() => {
          //Do some async work
        const result = v && v.length > 0;
        resolve(result); 
      }, 4000);
    });
  },
  message: 'A course should have at least one tag.'
  }
  },
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  price: {
    type: Number,
    required: function() { return this.isPublished; },
    min: 10,
    max: 200,
    get: v => Math.round(v),//For rounding numbers, see createCourse price: 15.8
    set: v => Math.round(v)
  }
  });

  // Compile the schema above into a model.
  const Course = mongoose.model('Course', courseSchema);

  async function createCourse() {//async executes an asynchronous operation to access database 
  const course = new Course({
    name: 'NodeJS',
    category: 'web',//Must be in lowercase
    author: 'Spencer Toyne',
    tags: ['frontend'],
    isPublished: true,
    price: 15.8
  });

  try {
    const result = await course.save();//Await asigns unique id, must be inside async function
    console.log(result);
  }
  catch (ex) {
    for (field in ex.errors)
    console.log(ex.errors[field].message);//Gives validation message for each invalid property
  }
  
  }

//Document Querying function  
async function getCourses() {
    const courses = await Course
    .find({ author: 'Spencer Toyne', isPublished: true })//Returns docs by author & isPublished.
    .limit(2)// Limits returned docs to 2 only
    .sort({ name: 1 })//Sorts by name in ascending alphabetical order, -1 for descending order
    .select({ name: 1, tags: 1 });//Returns course name and tags
    console.log(courses);
  }
  //Update document then return and display it.
  async function updateCourse(id) {
    const course = await Course.findByIdAndUpdate( id , {
      $set: {
        author: 'Spencer C. Toyne',
        isPublished: true
      }
    }, { new: true });//returns the updated doc.
    console.log(course);
  }

  async function removeCourse(id) {
    //const result = await Course.deleteOne({ _id: id }); - Deprecated
    //const course = await Course.findByIdAndRemove(id); - Deprecated
    const course = await Course.findOneAndDelete({ _id: id });//Updated delete function
    console.log(course);
  }
    
  
  createCourse();
  //removeCourse('652faac4f353a20379790c66');


  