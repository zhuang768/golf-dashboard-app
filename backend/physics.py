import math

def calculate_carry(ball_speed_mph: float, launch_angle_deg: float) -> float:
    """
    Calculate estimated carry distance in yards using projectile motion physics.
    Includes a basic estimation for air resistance and lift.
    """
    # Convert inputs to standard SI units (m/s and radians) for calculation
    ball_speed_ms = ball_speed_mph * 0.44704
    launch_angle_rad = math.radians(launch_angle_deg)
    
    # Gravity (m/s^2)
    g = 9.81
    
    # Ideal physics (vacuum)
    # R = v^2 * sin(2*theta) / g
    ideal_carry_meters = (ball_speed_ms ** 2) * math.sin(2 * launch_angle_rad) / g
    
    # In reality, golf balls have dimples creating lift (Magnus effect) and drag.
    # A highly simplified approximation: 
    # For typical launch angles (10-30 deg), carry is somewhat close to ideal
    # but air resistance reduces it, and backspin increases it.
    # We apply an empirical modifier based on ball speed (faster balls experience more drag).
    
    empirical_modifier = 0.85 # Simplified drag/lift factor
    
    actual_carry_meters = ideal_carry_meters * empirical_modifier
    
    # Convert meters to yards
    carry_yards = actual_carry_meters * 1.09361
    
    return round(carry_yards, 1)

def calculate_total(carry_yards: float, land_angle_deg: float) -> float:
    """
    Estimate total distance (carry + roll).
    Lower land angle = more roll.
    """
    # Highly simplified roll calculation
    # If land angle is steep (>45 deg), minimal roll.
    # If land angle is shallow (<30 deg), significant roll.
    
    if land_angle_deg >= 45:
        roll = carry_yards * 0.02
    elif land_angle_deg <= 30:
        roll = carry_yards * 0.15
    else:
        # Linear interpolation between 30 and 45 degrees
        ratio = (45 - land_angle_deg) / 15.0
        roll = carry_yards * (0.02 + ratio * 0.13)
        
    return round(carry_yards + roll, 1)
