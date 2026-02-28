import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AmenityType from '#models/amenity_type'

export default class extends BaseSeeder {
  async run() {
    // Use updateOrCreate to make this seeder idempotent

    // Clubs and Entertainment
    await AmenityType.updateOrCreate(
      { name: 'Clubs and Entertainment', subcategory: 'Cinema' },
      { name: 'Clubs and Entertainment', icon: '🎭', priority: 1, subcategory: 'Cinema' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Clubs and Entertainment', subcategory: 'Club' },
      { name: 'Clubs and Entertainment', icon: '🎭', priority: 1, subcategory: 'Club' }
    )

    // Community Services
    await AmenityType.updateOrCreate(
      { name: 'Community Services', subcategory: 'Library' },
      { name: 'Community Services', icon: '🏛️', priority: 2, subcategory: 'Library' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Community Services', subcategory: 'Post Office' },
      { name: 'Community Services', icon: '🏛️', priority: 2, subcategory: 'Post Office' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Community Services', subcategory: 'Police Station' },
      { name: 'Community Services', icon: '🏛️', priority: 2, subcategory: 'Police Station' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Community Services', subcategory: 'Playground' },
      { name: 'Community Services', icon: '🏛️', priority: 2, subcategory: 'Playground' }
    )

    // Food and Cafes
    await AmenityType.updateOrCreate(
      { name: 'Food and Cafes', subcategory: 'Cafe' },
      { name: 'Food and Cafes', icon: '☕', priority: 3, subcategory: 'Cafe' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Food and Cafes', subcategory: 'Restaurant' },
      { name: 'Food and Cafes', icon: '☕', priority: 3, subcategory: 'Restaurant' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Food and Cafes', subcategory: 'Take-away' },
      { name: 'Food and Cafes', icon: '☕', priority: 3, subcategory: 'Take-away' }
    )

    // Hair and Beauty
    await AmenityType.updateOrCreate(
      { name: 'Hair and Beauty', subcategory: 'Hairdresser' },
      { name: 'Hair and Beauty', icon: '💇', priority: 4, subcategory: 'Hairdresser' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Hair and Beauty', subcategory: 'Beautician' },
      { name: 'Hair and Beauty', icon: '💇', priority: 4, subcategory: 'Beautician' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Hair and Beauty', subcategory: 'Barber' },
      { name: 'Hair and Beauty', icon: '💇', priority: 4, subcategory: 'Barber' }
    )

    // Medical
    await AmenityType.updateOrCreate(
      { name: 'Medical', subcategory: 'GP/Clinic' },
      { name: 'Medical', icon: '🏥', priority: 5, subcategory: 'GP/Clinic' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Medical', subcategory: 'After Hours Medical' },
      { name: 'Medical', icon: '🏥', priority: 5, subcategory: 'After Hours Medical' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Medical', subcategory: 'Hospital with Emergency' },
      { name: 'Medical', icon: '🏥', priority: 5, subcategory: 'Hospital with Emergency' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Medical', subcategory: 'Other Hospitals' },
      { name: 'Medical', icon: '🏥', priority: 5, subcategory: 'Other Hospitals' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Medical', subcategory: 'Pharmacy' },
      { name: 'Medical', icon: '🏥', priority: 5, subcategory: 'Pharmacy' }
    )

    // Sport and Recreation
    await AmenityType.updateOrCreate(
      { name: 'Sport and Recreation', subcategory: 'Gym' },
      { name: 'Sport and Recreation', icon: '⚽', priority: 6, subcategory: 'Gym' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Sport and Recreation', subcategory: 'Pilates' },
      { name: 'Sport and Recreation', icon: '⚽', priority: 6, subcategory: 'Pilates' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Sport and Recreation', subcategory: 'Park' },
      { name: 'Sport and Recreation', icon: '⚽', priority: 6, subcategory: 'Park' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Sport and Recreation', subcategory: 'Sports Centre' },
      { name: 'Sport and Recreation', icon: '⚽', priority: 6, subcategory: 'Sports Centre' }
    )

    // Schools
    await AmenityType.updateOrCreate(
      { name: 'Schools', subcategory: 'High School' },
      { name: 'Schools', icon: '🏫', priority: 7, subcategory: 'High School' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Schools', subcategory: 'Primary School' },
      { name: 'Schools', icon: '🏫', priority: 7, subcategory: 'Primary School' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Schools', subcategory: 'Preschool and Daycare' },
      { name: 'Schools', icon: '🏫', priority: 7, subcategory: 'Preschool and Daycare' }
    )

    // Shopping
    await AmenityType.updateOrCreate(
      { name: 'Shopping', subcategory: 'Supermarket' },
      { name: 'Shopping', icon: '🛒', priority: 8, subcategory: 'Supermarket' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Shopping', subcategory: 'Shopping Centre' },
      { name: 'Shopping', icon: '🛒', priority: 8, subcategory: 'Shopping Centre' }
    )

    // Transport
    await AmenityType.updateOrCreate(
      { name: 'Transport', subcategory: 'Bus Stop' },
      { name: 'Transport', icon: '🚌', priority: 9, subcategory: 'Bus Stop' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Transport', subcategory: 'Train Station' },
      { name: 'Transport', icon: '🚌', priority: 9, subcategory: 'Train Station' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Transport', subcategory: 'Ferry' },
      { name: 'Transport', icon: '🚌', priority: 9, subcategory: 'Ferry' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Transport', subcategory: 'Light Rail' },
      { name: 'Transport', icon: '🚌', priority: 9, subcategory: 'Light Rail' }
    )
    await AmenityType.updateOrCreate(
      { name: 'Transport', subcategory: 'Petrol Station' },
      { name: 'Transport', icon: '🚌', priority: 9, subcategory: 'Petrol Station' }
    )
  }
}
